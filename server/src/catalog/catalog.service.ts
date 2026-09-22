import { BadRequestException, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'

// Default role privilege templates (intersected with package entitlement at provisioning)
const ROLE_TEMPLATES: Record<string, string[] | null> = {
  Admin: ['USER_VIEW', 'USER_MANAGE', 'ROLE_VIEW', 'ROLE_MANAGE'],
  Operational: [
    'DASHBOARD_VIEW',
    'TRANSACTION_VIEW',
    'TRANSACTION_DETAIL',
    'TRANSACTION_REFUND',
    'TRANSACTION_VOID',
    'SETTLEMENT_VIEW',
    'MERCHANT_VIEW',
    'PAYMENT_LINK_VIEW',
    'USER_VIEW',
  ],
  Finance: [
    'DASHBOARD_VIEW',
    'TRANSACTION_VIEW',
    'TRANSACTION_EXPORT',
    'SETTLEMENT_VIEW',
    'SETTLEMENT_EXPORT',
    'REPORT_VIEW',
    'REPORT_EXPORT',
  ],
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getCatalog() {
    const [modules, packages, partners] = await Promise.all([
      this.prisma.module.findMany({
        include: { privileges: { include: { feature: true } }, versions: { orderBy: { releasedAt: 'asc' } } },
        orderBy: { label: 'asc' },
      }),
      this.prisma.package.findMany({
        include: {
          entitlements: { include: { module: true, privilege: true } },
          moduleVersions: { include: { module: { select: { id: true } }, version: { select: { version: true } } } },
        },
      }),
      this.prisma.partner.findMany({
        include: {
          package: { select: { name: true } },
          moduleVersions: { include: { module: { select: { id: true } }, version: { select: { version: true } } } },
        },
      }),
    ])

    const privileges = modules.flatMap((m) =>
      m.privileges.map((p) => ({
        id: p.id,
        moduleId: m.id,
        feature: p.feature?.label ?? '',
        label: p.label,
      })),
    )

    return {
      modules: modules.map((m) => ({
        id: m.id,
        label: m.label,
        route: m.route,
        icon: m.icon,
        versions: m.versions.map((v) => ({ id: v.id, version: v.version })),
      })),
      privileges,
      packages: packages.map((p) => ({
        id: p.id,
        name: p.name,
        tier: p.tier,
        status: p.status,
        entitlements: {
          modules: p.entitlements.map((e) => e.module?.id).filter(Boolean),
          privileges: p.entitlements.map((e) => e.privilege?.id).filter(Boolean),
        },
        moduleVersions: p.moduleVersions.map((mv) => ({
          moduleId: mv.module.id,
          versionId: mv.versionId,
          version: mv.version.version,
        })),
      })),
      partners: partners.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        status: t.status,
        packageId: t.packageId,
        packageName: t.package.name,
        moduleVersions: t.moduleVersions.map((mv) => ({
          moduleId: mv.module.id,
          version: mv.version.version,
        })),
      })),
    }
  }

  async createPartner(
    dto: {
      name: string
      type: string
      packageId: string
      adminName: string
      adminEmail: string
      moduleVersions?: { moduleId: string; versionId: string }[]
    },
    actor: string,
  ) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: dto.packageId },
      include: {
        entitlements: { include: { privilege: true, module: true } },
        moduleVersions: true,
      },
    })
    if (!pkg) throw new BadRequestException('Unknown package')

    const existing = await this.prisma.user.findUnique({ where: { email: dto.adminEmail.trim().toLowerCase() } })
    if (existing) throw new BadRequestException('Admin email already exists')

    const packagePrivileges = pkg.entitlements
      .map((e) => e.privilege?.id)
      .filter(Boolean) as string[]

    const packageModuleIds = pkg.entitlements.map((e) => e.module?.id).filter(Boolean) as string[]
    const chosen = new Map((dto.moduleVersions ?? []).map((mv) => [mv.moduleId, mv.versionId]))
    const packagePins = new Map(pkg.moduleVersions.map((mv) => [mv.moduleId, mv.versionId]))

    const password = await bcrypt.hash('password123', 10)
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const partnerId = `${slug || 'partner'}-${Date.now()}`

    return this.prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({
        data: { id: partnerId, name: dto.name, type: dto.type, packageId: dto.packageId },
      })

      for (const moduleId of packageModuleIds) {
        let versionId = chosen.get(moduleId) ?? packagePins.get(moduleId)
        if (!versionId) {
          const latest = await tx.moduleVersion.findFirst({ where: { moduleId }, orderBy: { releasedAt: 'desc' } })
          versionId = latest?.id
        }
        if (!versionId) continue
        await tx.partnerModuleVersion.create({
          data: { partnerId, moduleId, versionId },
        })
      }

      const roles: Record<string, string> = {}
      for (const [roleName, template] of Object.entries(ROLE_TEMPLATES)) {
        const privilegeIds = template === null ? packagePrivileges : packagePrivileges.filter((p) => template.includes(p))
        const role = await tx.role.create({
          data: {
            id: `${partnerId}-${roleName.toLowerCase()}`,
            partnerId,
            name: roleName,
            rolePrivileges: { create: privilegeIds.map((privilegeId) => ({ privilegeId })) },
          },
          include: { rolePrivileges: true },
        })
        roles[roleName] = role.id
      }

      const admin = await tx.user.create({
        data: {
          id: `${partnerId}-admin`,
          partnerId,
          name: dto.adminName,
          email: dto.adminEmail.trim().toLowerCase(),
          password,
          userRoles: { create: [{ roleId: roles['Admin'] }] },
        },
      })

      return {
        id: partner.id,
        name: partner.name,
        type: partner.type,
        packageId: partner.packageId,
        roles: Object.keys(roles),
        admin: { id: admin.id, email: admin.email, name: admin.name },
      }
    }).then(async (result) => {
      await this.audit.log({ actor, action: 'PARTNER_CREATED', partnerId: result.id, target: result.name })
      return result
    })
  }

  async createPackage(
    dto: { name: string; tier: string; moduleIds: string[]; privilegeIds: string[]; moduleVersions?: { moduleId: string; versionId: string }[] },
    actor: string,
  ) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const pkg = await this.prisma.package.create({
      data: {
        id: `${slug || 'package'}-${Date.now()}`,
        name: dto.name,
        tier: dto.tier,
        entitlements: {
          create: [
            ...dto.moduleIds.map((moduleId) => ({ moduleId })),
            ...dto.privilegeIds.map((privilegeId) => ({ privilegeId })),
          ],
        },
        moduleVersions: {
          create: (dto.moduleVersions ?? []).map((mv) => ({ moduleId: mv.moduleId, versionId: mv.versionId })),
        },
      },
      include: { entitlements: true, moduleVersions: true },
    })
    await this.audit.log({ actor, action: 'PACKAGE_CREATED', target: pkg.name })
    return pkg
  }

  async updatePackage(
    id: string,
    dto: { name?: string; tier?: string; moduleIds?: string[]; privilegeIds?: string[]; moduleVersions?: { moduleId: string; versionId: string }[] },
    actor: string,
  ) {
    const pkg = await this.prisma.package.findUnique({ where: { id } })
    if (!pkg) throw new BadRequestException('Package not found')
    const { moduleIds, privilegeIds, moduleVersions, ...rest } = dto
    if (rest.name || rest.tier) {
      await this.prisma.package.update({ where: { id }, data: rest })
    }
    if (moduleIds !== undefined && privilegeIds !== undefined) {
      await this.prisma.packageEntitlement.deleteMany({ where: { packageId: id } })
      if (moduleIds.length || privilegeIds.length) {
        await this.prisma.packageEntitlement.createMany({
          data: [
            ...moduleIds.map((moduleId) => ({ packageId: id, moduleId, privilegeId: null })),
            ...privilegeIds.map((privilegeId) => ({ packageId: id, moduleId: null, privilegeId })),
          ],
        })
      }
    }
    if (moduleVersions !== undefined) {
      await this.prisma.packageModuleVersion.deleteMany({ where: { packageId: id } })
      if (moduleVersions.length) {
        await this.prisma.packageModuleVersion.createMany({
          data: moduleVersions.map((mv) => ({ packageId: id, moduleId: mv.moduleId, versionId: mv.versionId })),
        })
      }
    }
    const updated = await this.prisma.package.findUnique({ where: { id }, include: { entitlements: true, moduleVersions: true } })
    await this.audit.log({ actor, action: 'PACKAGE_UPDATED', target: updated?.name ?? id })
    return updated
  }

  async createModuleVersion(moduleId: string, version: string, actor: string) {
    const mod = await this.prisma.module.findUnique({ where: { id: moduleId } })
    if (!mod) throw new BadRequestException('Unknown module')
    const existing = await this.prisma.moduleVersion.findUnique({
      where: { moduleId_version: { moduleId, version } },
    })
    if (existing) throw new BadRequestException('Version already exists')
    const created = await this.prisma.moduleVersion.create({
      data: { id: `${moduleId}-${version}`, moduleId, version },
    })
    await this.audit.log({ actor, action: 'MODULE_VERSION_CREATED', target: `${mod.label} ${version}` })
    return created
  }

  async createModule(dto: { label: string; route: string; icon: string }, actor: string) {
    const slug = dto.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const id = slug || 'module'
    const existing = await this.prisma.module.findUnique({ where: { id } })
    if (existing) throw new BadRequestException('Module already exists')
    const created = await this.prisma.module.create({
      data: { id, label: dto.label, route: dto.route || `/${id}`, icon: dto.icon || 'Boxes' },
    })
    await this.audit.log({ actor, action: 'MODULE_CREATED', target: dto.label })
    return created
  }

  async createPrivilege(dto: { moduleId: string; feature: string; label: string }, actor: string) {
    const mod = await this.prisma.module.findUnique({ where: { id: dto.moduleId } })
    if (!mod) throw new BadRequestException('Unknown module')

    const privilegeId = dto.label.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/(^_|_$)/g, '')
    const existingPriv = await this.prisma.privilege.findUnique({ where: { id: privilegeId } })
    if (existingPriv) throw new BadRequestException('Privilege code already exists')

    return this.prisma.$transaction(async (tx) => {
      const featureSlug = dto.feature.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      let feature = await tx.feature.findFirst({ where: { moduleId: dto.moduleId, label: dto.feature } })
      if (!feature) {
        feature = await tx.feature.create({
          data: { id: `${dto.moduleId}-${featureSlug}`, moduleId: dto.moduleId, label: dto.feature },
        })
      }
      const privilege = await tx.privilege.create({
        data: { id: privilegeId, moduleId: dto.moduleId, featureId: feature.id, label: dto.label },
      })
      await this.audit.log({ actor, action: 'PRIVILEGE_CREATED', target: privilegeId })
      return privilege
    })
  }
}
