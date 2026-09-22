import { useState } from 'react'
import { Plus, Pencil, X } from 'lucide-react'
import { Card, CardContent, Badge, Button, Input } from '../../components/ui'
import { useCatalog, useCreatePackage, useUpdatePackage } from '../../lib/store'
import { PrivilegePicker } from './PrivilegePicker'

interface Pkg {
  id: string
  name: string
  tier: string
  entitlements: { modules: string[]; privileges: string[] }
  moduleVersions: { moduleId: string; versionId: string; version: string }[]
}

interface ModuleRef {
  id: string
  label: string
  versions: { id: string; version: string }[]
}

export function PackageManager() {
  const { data } = useCatalog()
  const modules: ModuleRef[] = data?.modules ?? []
  const privileges = data?.privileges ?? []
  const packages: Pkg[] = data?.packages ?? []

  const createPackage = useCreatePackage()
  const updatePackage = useUpdatePackage()

  const [editing, setEditing] = useState<Pkg | null>(null)
  const [creating, setCreating] = useState(false)

  function startCreate() {
    setEditing(null)
    setCreating(true)
  }

  function versionLabel(pkg: Pkg, moduleId: string) {
    return pkg.moduleVersions.find((mv) => mv.moduleId === moduleId)?.version ?? 'latest'
  }

  return (
    <div className="space-y-4">
      {creating || editing ? (
        <PackageForm
          key={editing?.id ?? 'new'}
          pkg={editing}
          modules={modules}
          privileges={privileges}
          onCancel={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSave={async (dto) => {
            if (editing) {
              await updatePackage.mutateAsync({ id: editing.id, dto })
            } else {
              await createPackage.mutateAsync(dto)
            }
            setCreating(false)
            setEditing(null)
          }}
        />
      ) : (
        <div className="flex justify-end">
          <Button onClick={startCreate}>
            <Plus className="size-4" /> New package
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold">{pkg.name}</h3>
                  <p className="text-xs text-content-secondary">{pkg.tier}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="brand">{pkg.entitlements.modules.length} modules</Badge>
                  <button
                    onClick={() => {
                      setCreating(false)
                      setEditing(pkg)
                    }}
                    className="rounded-md p-1.5 text-content-secondary hover:bg-slate-100 hover:text-foreground"
                    title="Edit"
                  >
                    <Pencil className="size-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                {modules
                  .filter((m) => pkg.entitlements.modules.includes(m.id))
                  .map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-sm">
                      <span className="text-content-secondary">{m.label}</span>
                      <span className="flex items-center gap-2">
                        <Badge variant="neutral">@{versionLabel(pkg, m.id)}</Badge>
                        <span className="font-mono text-[11px] text-content-secondary">
                          {pkg.entitlements.privileges.filter((p) =>
                            privileges.find((x) => x.id === p)?.moduleId === m.id,
                          ).length}{' '}
                          priv
                        </span>
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PackageForm({
  pkg,
  modules,
  privileges,
  onCancel,
  onSave,
}: {
  pkg: Pkg | null
  modules: ModuleRef[]
  privileges: { id: string; moduleId: string; label: string }[]
  onCancel: () => void
  onSave: (dto: {
    name: string
    tier: string
    moduleIds: string[]
    privilegeIds: string[]
    moduleVersions: { moduleId: string; versionId: string }[]
  }) => Promise<unknown>
}) {
  const [name, setName] = useState(pkg?.name ?? '')
  const [tier, setTier] = useState(pkg?.tier ?? 'standard')
  const [moduleIds, setModuleIds] = useState<string[]>(pkg?.entitlements.modules ?? [])
  const [privilegeIds, setPrivilegeIds] = useState<string[]>(pkg?.entitlements.privileges ?? [])
  const [versionIds, setVersionIds] = useState<Record<string, string>>(
    () => Object.fromEntries((pkg?.moduleVersions ?? []).map((mv) => [mv.moduleId, mv.versionId])),
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const versionsMap = Object.fromEntries(modules.map((m) => [m.id, m.versions]))

  function versionFor(moduleId: string) {
    return versionIds[moduleId] ?? modules.find((m) => m.id === moduleId)?.versions.at(-1)?.id ?? ''
  }

  function toggleModule(id: string) {
    setModuleIds((prev) => {
      if (prev.includes(id)) {
        const privs = privileges.filter((p) => p.moduleId === id).map((p) => p.id)
        setPrivilegeIds((cur) => cur.filter((p) => !privs.includes(p)))
        return prev.filter((m) => m !== id)
      }
      return [...prev, id]
    })
  }

  function togglePrivilege(id: string) {
    setPrivilegeIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  function selectVersion(moduleId: string, versionId: string) {
    setVersionIds((prev) => ({ ...prev, [moduleId]: versionId }))
  }

  async function save() {
    setError(null)
    setSaving(true)
    try {
      const moduleVersions = moduleIds
        .map((moduleId) => ({ moduleId, versionId: versionFor(moduleId) }))
        .filter((x) => x.versionId)
      await onSave({ name, tier, moduleIds, privilegeIds, moduleVersions })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">{pkg ? 'Edit package' : 'New package'}</h3>
          <button onClick={onCancel} className="rounded-md p-1.5 text-content-secondary hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-content-secondary">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Merchant Pro" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-content-secondary">Tier</label>
            <select
              className="h-10 w-full rounded-md border border-border-base bg-white px-3 text-sm"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
            >
              {['standard', 'enterprise', 'premium'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-content-secondary">
          Modules, versions & privileges
        </p>
        <PrivilegePicker
          modules={modules}
          privileges={privileges}
          moduleIds={moduleIds}
          privilegeIds={privilegeIds}
          onToggleModule={toggleModule}
          onTogglePrivilege={togglePrivilege}
          versions={versionsMap}
          versionIds={versionIds}
          onSelectVersion={selectVersion}
        />

        {error && <p className="mt-3 rounded-md bg-surface-error px-3 py-2 text-sm text-content-error">{error}</p>}

        <div className="mt-4 flex gap-2">
          <Button disabled={!name || saving} onClick={save}>
            {saving ? 'Saving…' : 'Save package'}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
