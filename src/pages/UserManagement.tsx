import { useState } from 'react'
import { Plus, Users, ShieldCheck, Building2 } from 'lucide-react'
import { Card, CardContent, PageHeader, Badge, Button, Input } from '../components/ui'
import type { Org, Role, UserRec } from '../lib/platform'
import {
  useAbility,
  useUsers,
  useRoles,
  useOrgs,
  useCreateUser,
  useUpdateUser,
  useCreateRole,
  useUpdateRole,
  useCreateOrg,
} from '../lib/store'
import { Can } from '../components/Can'
import { cn } from '../lib/utils'

type Tab = 'users' | 'roles' | 'org'

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'roles', label: 'Roles', icon: ShieldCheck },
  { id: 'org', label: 'Organization', icon: Building2 },
]

export function UserManagement() {
  const [tab, setTab] = useState<Tab>('users')
  const ctx = useAbility()
  const partnerId = ctx?.partner?.id

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Users, roles, and organization structure for your partner."
      />

      <div className="mb-6 flex gap-1 border-b border-border-base">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === t.id
                ? 'border-surface-primary text-surface-primary'
                : 'border-transparent text-content-secondary hover:text-foreground',
            )}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>

      {!partnerId ? (
        <p className="text-sm text-content-secondary">No partner context.</p>
      ) : tab === 'users' ? (
        <UsersTab partnerId={partnerId} />
      ) : tab === 'roles' ? (
        <RolesTab />
      ) : (
        <OrgTab partnerId={partnerId} />
      )}
    </div>
  )
}

function roleName(id: string, roles: Role[]) {
  return roles.find((r) => r.id === id)?.name ?? '—'
}

function UsersTab({ partnerId }: { partnerId: string }) {
  const { data: users = [] } = useUsers()
  const { data: roles = [] } = useRoles()
  const { data: orgs = [] } = useOrgs()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const partnerUsers = users.filter((u) => u.partnerId === partnerId && !u.isVendor)

  function orgName(id: string) {
    return orgs.find((o) => o.id === id)?.name ?? id
  }

  return (
    <div className="space-y-4">
      <Can i="USER_MANAGE">
        <Card>
          <CardContent className="flex flex-wrap items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-content-secondary">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-content-secondary">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@partner.com" />
            </div>
            <Button
              disabled={!name || !email || createUser.isPending}
              onClick={() => {
                createUser.mutate({ name, email })
                setName('')
                setEmail('')
              }}
            >
              <Plus className="size-4" /> Add user
            </Button>
          </CardContent>
        </Card>
      </Can>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-base text-left text-xs text-content-secondary">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Roles</th>
                <th className="px-5 py-3 font-medium">Scope</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {partnerUsers.map((u) => (
                <tr key={u.id} className="border-b border-border-base last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-content-secondary">{u.email}</p>
                  </td>
                  <td className="px-5 py-3 text-content-secondary">
                    {u.roleIds.map((r) => roleName(r, roles)).join(', ') || '—'}
                  </td>
                  <td className="px-5 py-3 text-content-secondary">
                    {u.orgIds.map(orgName).join(', ') || '—'}
                  </td>
                  <td className="px-5 py-3">
                    <UserStatusControl
                      user={u}
                      roles={roles}
                      orgs={orgs}
                      onRole={(roleIds) => updateUser.mutate({ id: u.id, patch: { roleIds } })}
                      onOrg={(orgIds) => updateUser.mutate({ id: u.id, patch: { orgIds } })}
                      onStatus={(status) => updateUser.mutate({ id: u.id, patch: { status } })}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function UserStatusControl({
  user,
  roles,
  orgs,
  onRole,
  onOrg,
  onStatus,
}: {
  user: UserRec
  roles: Role[]
  orgs: Org[]
  onRole: (roleIds: string[]) => void
  onOrg: (orgIds: string[]) => void
  onStatus: (status: UserRec['status']) => void
}) {
  const statusVariant: Record<string, 'success' | 'error' | 'pending' | 'neutral'> = {
    active: 'success',
    suspended: 'error',
    invited: 'pending',
    deactivated: 'neutral',
  }
  const [orgOpen, setOrgOpen] = useState(false)
  const partnerOrgs = orgs.filter((o) => o.partnerId === user.partnerId)
  const orgNames = user.orgIds.map((id) => orgs.find((o) => o.id === id)?.name).filter(Boolean)

  function toggleOrg(id: string) {
    onOrg(user.orgIds.includes(id) ? user.orgIds.filter((x) => x !== id) : [...user.orgIds, id])
  }

  return (
    <div className="flex items-end gap-2">
      <Can i="USER_MANAGE">
        <>
          <select
            className="rounded-md border border-border-base bg-white px-2 py-1 text-xs"
            value={user.roleIds[0] ?? ''}
            onChange={(e) => onRole(e.target.value ? [e.target.value] : [])}
          >
            <option value="">No role</option>
            {roles
              .filter((r) => r.partnerId === user.partnerId)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOrgOpen((v) => !v)}
              className="h-[22px] max-w-40 truncate rounded-md border border-border-base bg-white px-2 text-xs"
              title={orgNames.join(', ') || 'Assign organization scope'}
            >
              {orgNames.length ? orgNames.join(', ') : 'Assign orgs'}
            </button>
            {orgOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOrgOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-md border border-border-base bg-white p-1 shadow-lg">
                  {partnerOrgs.map((o) => (
                    <label
                      key={o.id}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        className="accent-surface-primary"
                        checked={user.orgIds.includes(o.id)}
                        onChange={() => toggleOrg(o.id)}
                      />
                      {o.name}
                    </label>
                  ))}
                  {partnerOrgs.length === 0 && (
                    <p className="px-2 py-1 text-xs text-content-secondary">No orgs yet.</p>
                  )}
                </div>
              </>
            )}
          </div>
          <select
            className="rounded-md border border-border-base bg-white px-2 py-1 text-xs"
            value={user.status}
            onChange={(e) => onStatus(e.target.value as UserRec['status'])}
          >
            <option value="active">active</option>
            <option value="suspended">suspended</option>
            <option value="invited">invited</option>
            <option value="deactivated">deactivated</option>
          </select>
        </>
      </Can>
      <Badge variant={statusVariant[user.status] ?? 'neutral'}>{user.status}</Badge>
    </div>
  )
}

function RolesTab() {
  const ctx = useAbility()
  const { data: roles = [] } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const [selected, setSelected] = useState<string | null>(null)

  const allowed = new Set(ctx?.pkg?.entitlements.privileges ?? [])
  const allowedModules = ctx?.pkg?.entitlements.modules ?? []
  const modules = ctx?.catalog.modules ?? []
  const privileges = ctx?.catalog.privileges ?? []
  const selectedRole = roles.find((r) => r.id === selected) ?? null

  function setPrivileges(role: Role, privileges: string[]) {
    updateRole.mutate({ id: role.id, patch: { privilegeIds: privileges } })
  }

  function togglePrivilege(role: Role, priv: string) {
    const has = role.privileges.includes(priv)
    setPrivileges(role, has ? role.privileges.filter((p) => p !== priv) : [...role.privileges, priv])
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardContent className="space-y-1">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Roles</h3>
            <Can i="ROLE_MANAGE">
              <button
                onClick={() => createRole.mutate({}, { onSuccess: (r) => setSelected(r.id) })}
                className="inline-flex items-center gap-1 text-xs font-medium text-surface-primary hover:underline"
              >
                <Plus className="size-3.5" /> New
              </button>
            </Can>
          </div>
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm',
                selected === r.id ? 'bg-surface-primary/10 font-medium' : 'hover:bg-slate-100',
              )}
            >
              <span>{r.name}</span>
              <span className="text-xs text-content-secondary">{r.privileges.length} priv</span>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent>
          {!selectedRole ? (
            <p className="py-8 text-center text-sm text-content-secondary">Select a role to edit its privileges.</p>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold">{selectedRole.name}</h3>
                <Can i="ROLE_MANAGE">
                  <button
                    onClick={() =>
                      updateRole.mutate({
                        id: selectedRole.id,
                        patch: { status: selectedRole.status === 'active' ? 'inactive' : 'active' },
                      })
                    }
                    className="text-xs font-medium text-content-secondary hover:text-foreground"
                  >
                    {selectedRole.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </Can>
              </div>

              {modules
                .filter((m) => allowedModules.includes(m.id))
                .map((m) => {
                  const modPrivs = privileges.filter((p) => p.moduleId === m.id && allowed.has(p.id))
                  if (modPrivs.length === 0) return null
                  return (
                    <div key={m.id} className="mb-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-content-secondary">
                        {m.label}
                      </p>
                      <div className="grid gap-1 sm:grid-cols-2">
                        {modPrivs.map((p) => {
                          const checked = selectedRole.privileges.includes(p.id)
                          return (
                            <label key={p.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50">
                              <Can i="ROLE_MANAGE">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePrivilege(selectedRole, p.id)}
                                  className="accent-surface-primary"
                                />
                              </Can>
                              <span className="flex-1">{p.label}</span>
                              <span className="text-[11px] text-content-secondary">{p.id}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function OrgTab({ partnerId }: { partnerId: string }) {
  const { data: orgs = [] } = useOrgs()
  const createOrg = useCreateOrg()
  const [name, setName] = useState('')
  const partnerOrgs = orgs.filter((o) => o.partnerId === partnerId)
  const roots = partnerOrgs.filter((o) => !o.parentId)

  function children(parentId: string) {
    return partnerOrgs.filter((o) => o.parentId === parentId)
  }

  function renderOrg(id: string, depth: number) {
    const org = partnerOrgs.find((o) => o.id === id)
    if (!org) return null
    return (
      <div key={id}>
        <div className="flex items-center gap-2 py-1" style={{ paddingLeft: depth * 20 }}>
          <Building2 className="size-4 text-content-secondary" />
          <span className="text-sm">{org.name}</span>
        </div>
        {children(id).map((c) => renderOrg(c.id, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Can i="USER_MANAGE">
        <Card>
          <CardContent className="flex items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-content-secondary">New unit</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Unit name" />
            </div>
            <Button
              disabled={!name || createOrg.isPending}
              onClick={() => {
                createOrg.mutate({ name })
                setName('')
              }}
            >
              <Plus className="size-4" /> Add
            </Button>
          </CardContent>
        </Card>
      </Can>
      <Card>
        <CardContent>{roots.map((r) => renderOrg(r.id, 0))}</CardContent>
      </Card>
    </div>
  )
}
