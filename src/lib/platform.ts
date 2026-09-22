// Platform domain types + pure access helper (data comes from the backend API)

export interface Privilege {
  id: string
  moduleId: string
  feature: string
  label: string
}

export interface ModuleDef {
  id: string
  label: string
  route: string
  icon: string
}

export interface Package {
  id: string
  name: string
  tier: string
  entitlements: { modules: string[]; privileges: string[] }
}

export interface Tenant {
  id: string
  name: string
  type: string
  packageId: string
}

export interface Role {
  id: string
  tenantId: string
  name: string
  privileges: string[]
  status: 'active' | 'inactive'
}

export type UserStatus = 'invited' | 'active' | 'suspended' | 'deactivated'

export interface UserRec {
  id: string
  tenantId: string | null
  name: string
  email: string
  roleIds: string[]
  orgIds: string[]
  status: UserStatus
  isVendor: boolean
}

export interface Org {
  id: string
  tenantId: string
  name: string
  parentId?: string
}

export interface SessionContext {
  user: UserRec
  isVendor: boolean
  tenant: { id: string; name: string; type: string; packageId: string } | null
  pkg: Package | null
  roles: Role[]
  privileges: string[]
  modules: string[]
  orgIds: string[]
  catalog: {
    modules: ModuleDef[]
    privileges: Privilege[]
  }
}

export function can(ctx: SessionContext | null, privilege: string): boolean {
  return !!ctx && ctx.privileges.includes(privilege)
}
