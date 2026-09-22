import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface SessionContext {
  user: {
    id: string
    tenantId: string | null
    name: string
    email: string
    roleIds: string[]
    orgIds: string[]
    status: string
    isVendor: boolean
  }
  isVendor: boolean
  tenant: { id: string; name: string; type: string; packageId: string } | null
  pkg: { id: string; name: string; tier: string; entitlements: { modules: string[]; privileges: string[] } } | null
  roles: { id: string; tenantId: string; name: string; privileges: string[]; status: string }[]
  privileges: string[]
  modules: string[]
  orgIds: string[]
  catalog: {
    modules: { id: string; label: string; route: string; icon: string }[]
    privileges: { id: string; moduleId: string; feature: string; label: string }[]
  }
}

@Injectable()
export class ContextService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(userId: string): Promise<SessionContext | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: { include: { rolePrivileges: { include: { privilege: true } } } } } },
        userScopes: { include: { org: true } },
        tenant: {
          include: {
            package: { include: { entitlements: { include: { module: true, privilege: true } } } },
          },
        },
      },
    })
    if (!user) return null

    const orgIds = user.userScopes.map((s) => s.orgId)

    const catalog = await this.getCatalog()

    if (user.isVendor) {
      return {
        user: { id: user.id, tenantId: null, name: user.name, email: user.email, roleIds: [], orgIds: [], status: user.status, isVendor: true },
        isVendor: true,
        tenant: null,
        pkg: null,
        roles: [],
        privileges: [],
        modules: [],
        orgIds,
        catalog,
      }
    }

    const tenant = user.tenant
    const pkg = tenant?.package ?? null

    const roles = user.userRoles
      .map((ur) => ur.role)
      .filter((r) => r.status === 'active')
      .map((r) => ({
        id: r.id,
        tenantId: r.tenantId,
        name: r.name,
        status: r.status,
        privileges: r.rolePrivileges.map((rp) => rp.privilege.id),
      }))

    const allowedPrivileges = new Set(
      (pkg?.entitlements ?? []).map((e) => e.privilege?.id).filter(Boolean) as string[],
    )
    const activePriv = new Set(roles.flatMap((r) => r.privileges))

    let privileges: string[] = []
    const modules = new Set<string>()
    if (user.status === 'active' && pkg) {
      privileges = [...activePriv].filter((p) => allowedPrivileges.has(p))
      if (privileges.length > 0) {
        const mods = await this.prisma.privilege.findMany({
          where: { id: { in: privileges } },
          select: { moduleId: true },
        })
        const held = new Set(mods.map((p) => p.moduleId))
        for (const e of pkg.entitlements) {
          if (e.module?.id && held.has(e.module.id)) modules.add(e.module.id)
        }
      }
    }

    const moduleIds = (pkg?.entitlements ?? [])
      .map((e) => e.module?.id)
      .filter(Boolean) as string[]

    return {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        roleIds: user.userRoles.map((ur) => ur.roleId),
        orgIds,
        status: user.status,
        isVendor: false,
      },
      isVendor: false,
      tenant: tenant ? { id: tenant.id, name: tenant.name, type: tenant.type, packageId: tenant.packageId } : null,
      pkg: pkg
        ? {
            id: pkg.id,
            name: pkg.name,
            tier: pkg.tier,
            entitlements: { modules: moduleIds, privileges: [...allowedPrivileges] },
          }
        : null,
      roles,
      privileges,
      modules: [...modules],
      orgIds,
      catalog,
    }
  }

  private async getCatalog() {
    const modules = await this.prisma.module.findMany({
      include: { privileges: { include: { feature: true } } },
      orderBy: { label: 'asc' },
    })
    return {
      modules: modules.map((m) => ({ id: m.id, label: m.label, route: m.route, icon: m.icon })),
      privileges: modules.flatMap((m) =>
        m.privileges.map((p) => ({
          id: p.id,
          moduleId: m.id,
          feature: p.feature?.label ?? '',
          label: p.label,
        })),
      ),
    }
  }
}
