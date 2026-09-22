import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async partnerOf(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.partnerId) throw new BadRequestException('No partner context')
    return user.partnerId
  }

  // ---- users ----

  async listUsers(userId: string) {
    const partnerId = await this.partnerOf(userId)
    const users = await this.prisma.user.findMany({
      where: { partnerId },
      include: { userRoles: true, userScopes: true },
    })
    return users.map((u) => this.shapeUser(u))
  }

  async createUser(userId: string, dto: { name: string; email: string; password?: string }) {
    const partnerId = await this.partnerOf(userId)
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } })
    if (existing) throw new BadRequestException('Email already exists')
    const password = await bcrypt.hash(dto.password ?? 'password123', 10)
    const user = await this.prisma.user.create({
      data: {
        id: 'user-' + Date.now(),
        partnerId,
        name: dto.name,
        email: dto.email.trim().toLowerCase(),
        password,
      },
      include: { userRoles: true, userScopes: true },
    })
    await this.audit.log({ actor: userId, action: 'USER_CREATED', partnerId, target: user.email })
    return this.shapeUser(user)
  }

  async updateUser(userId: string, id: string, dto: { name?: string; email?: string; status?: string; roleIds?: string[]; orgIds?: string[] }) {
    const partnerId = await this.partnerOf(userId)
    await this.assertBelongsToPartner('user', id, partnerId)
    const { roleIds, orgIds, ...rest } = dto
    await this.prisma.user.update({ where: { id }, data: rest })
    if (roleIds) {
      await this.prisma.userRole.deleteMany({ where: { userId: id } })
      await this.prisma.userRole.createMany({ data: roleIds.map((roleId) => ({ userId: id, roleId })) })
    }
    if (orgIds) {
      await this.prisma.accessScope.deleteMany({ where: { userId: id } })
      await this.prisma.accessScope.createMany({ data: orgIds.map((orgId) => ({ userId: id, orgId })) })
    }
    const user = await this.prisma.user.findUnique({ where: { id }, include: { userRoles: true, userScopes: true } })
    await this.audit.log({ actor: userId, action: 'USER_UPDATED', partnerId, target: user?.email ?? id })
    return user ? this.shapeUser(user) : null
  }

  // ---- roles ----

  async listRoles(userId: string) {
    const partnerId = await this.partnerOf(userId)
    const roles = await this.prisma.role.findMany({
      where: { partnerId },
      include: { rolePrivileges: true },
    })
    return roles.map((r) => this.shapeRole(r))
  }

  async createRole(userId: string, dto: { name?: string; privilegeIds?: string[] }) {
    const partnerId = await this.partnerOf(userId)
    const role = await this.prisma.role.create({
      data: {
        id: 'role-' + Date.now(),
        partnerId,
        name: dto.name ?? 'New Role',
        rolePrivileges: { create: (dto.privilegeIds ?? []).map((privilegeId) => ({ privilegeId })) },
      },
      include: { rolePrivileges: true },
    })
    await this.audit.log({ actor: userId, action: 'ROLE_CREATED', partnerId, target: role.name })
    return this.shapeRole(role)
  }

  async updateRole(userId: string, id: string, dto: { name?: string; status?: string; privilegeIds?: string[] }) {
    const partnerId = await this.partnerOf(userId)
    await this.assertBelongsToPartner('role', id, partnerId)
    const { privilegeIds, ...rest } = dto
    await this.prisma.role.update({ where: { id }, data: rest })
    if (privilegeIds) {
      await this.prisma.rolePrivilege.deleteMany({ where: { roleId: id } })
      await this.prisma.rolePrivilege.createMany({ data: privilegeIds.map((privilegeId) => ({ roleId: id, privilegeId })) })
    }
    const role = await this.prisma.role.findUnique({ where: { id }, include: { rolePrivileges: true } })
    await this.audit.log({ actor: userId, action: 'ROLE_UPDATED', partnerId, target: role?.name ?? id })
    return role ? this.shapeRole(role) : null
  }

  // ---- orgs ----

  async listOrgs(userId: string) {
    const partnerId = await this.partnerOf(userId)
    return this.prisma.organization.findMany({ where: { partnerId } })
  }

  async createOrg(userId: string, dto: { name: string; parentId?: string }) {
    const partnerId = await this.partnerOf(userId)
    const org = await this.prisma.organization.create({
      data: { id: 'org-' + Date.now(), partnerId, name: dto.name, parentId: dto.parentId },
    })
    await this.audit.log({ actor: userId, action: 'ORG_CREATED', partnerId, target: org.name })
    return org
  }

  private async assertBelongsToPartner(kind: 'user' | 'role', id: string, partnerId: string) {
    const row =
      kind === 'user'
        ? await this.prisma.user.findUnique({ where: { id } })
        : await this.prisma.role.findUnique({ where: { id } })
    if (!row || (row as { partnerId?: string | null }).partnerId !== partnerId) {
      throw new NotFoundException(`${kind} not found`)
    }
  }

  private shapeUser(u: {
    id: string
    partnerId: string | null
    name: string
    email: string
    status: string
    isVendor: boolean
    userRoles: { roleId: string }[]
    userScopes: { orgId: string }[]
  }) {
    return {
      id: u.id,
      partnerId: u.partnerId,
      name: u.name,
      email: u.email,
      status: u.status,
      isVendor: u.isVendor,
      roleIds: u.userRoles.map((ur) => ur.roleId),
      orgIds: u.userScopes.map((s) => s.orgId),
    }
  }

  private shapeRole(r: {
    id: string
    partnerId: string
    name: string
    status: string
    rolePrivileges: { privilegeId: string }[]
  }) {
    return {
      id: r.id,
      partnerId: r.partnerId,
      name: r.name,
      status: r.status,
      privileges: r.rolePrivileges.map((rp) => rp.privilegeId),
    }
  }
}
