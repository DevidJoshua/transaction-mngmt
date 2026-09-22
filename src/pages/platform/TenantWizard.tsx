import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, Badge, Button, Input } from '../../components/ui'
import { useCatalog, useCreateTenant, useCreatePackage } from '../../lib/store'
import { PrivilegePicker } from './PrivilegePicker'
import { cn } from '../../lib/utils'

const STEPS = ['Tenant', 'Package & modules', 'Module versions', 'Initial admin', 'Review']

export function TenantWizard() {
  const { data } = useCatalog()
  const modules = data?.modules ?? []
  const privileges = data?.privileges ?? []
  const packages = data?.packages ?? []

  const createTenant = useCreateTenant()
  const createPackage = useCreatePackage()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [type, setType] = useState('Bank')

  const [packageMode, setPackageMode] = useState<'existing' | 'new'>('existing')
  const [existingPackageId, setExistingPackageId] = useState('')
  const [newName, setNewName] = useState('')
  const [newTier, setNewTier] = useState('standard')
  const [moduleIds, setModuleIds] = useState<string[]>([])
  const [privilegeIds, setPrivilegeIds] = useState<string[]>([])
  const [versionIds, setVersionIds] = useState<Record<string, string>>({})

  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const selectedPackage = packages.find((p) => p.id === existingPackageId)

  const targetModuleIds = packageMode === 'existing' ? (selectedPackage?.entitlements.modules ?? []) : moduleIds
  const versionModules = modules.filter((m) => targetModuleIds.includes(m.id))

  const canNext =
    (step === 0 && !!name) ||
    (step === 1 && (packageMode === 'existing' ? !!existingPackageId : !!newName && moduleIds.length > 0)) ||
    (step === 2 && true) ||
    (step === 3 && !!adminName && !!adminEmail)

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

  function effectiveVersionId(moduleId: string) {
    if (versionIds[moduleId]) return versionIds[moduleId]
    const pin = selectedPackage?.moduleVersions.find((mv) => mv.moduleId === moduleId)
    if (pin) return pin.versionId
    const m = modules.find((x) => x.id === moduleId)
    return m?.versions[m.versions.length - 1]?.id ?? ''
  }

  async function submit() {
    setError(null)
    setDone(null)
    try {
      let packageId = existingPackageId
      if (packageMode === 'new') {
        const created = await createPackage.mutateAsync({
          name: newName,
          tier: newTier,
          moduleIds,
          privilegeIds,
        })
        packageId = created.id
      }
      const moduleVersions = targetModuleIds
        .map((mid) => ({ moduleId: mid, versionId: effectiveVersionId(mid) }))
        .filter((x) => x.versionId)
      const res = await createTenant.mutateAsync({
        name,
        type,
        packageId,
        adminName,
        adminEmail,
        moduleVersions,
      })
      setDone(
        `Onboarding complete — ${res.name}. Roles: ${res.roles.join(', ')}. Admin: ${res.admin.email} (password123)`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-xs font-medium',
                  i < step
                    ? 'bg-surface-primary text-white'
                    : i === step
                      ? 'bg-surface-primary/15 text-surface-primary'
                      : 'bg-slate-100 text-content-secondary',
                )}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </div>
              <span className={cn('text-xs font-medium', i === step ? 'text-foreground' : 'text-content-secondary')}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="h-px w-6 bg-border-base" />}
            </div>
          ))}
        </div>

        {done ? (
          <div className="space-y-4">
            <p className="rounded-md bg-surface-success px-3 py-2 text-sm text-content-success">{done}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Done
            </Button>
          </div>
        ) : (
          <>
            {step === 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-content-secondary">Tenant name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bank C" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-content-secondary">Type</label>
                  <select
                    className="h-10 w-full rounded-md border border-border-base bg-white px-3 text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {['Bank', 'Merchant', 'Merchant Aggregator', 'Corporate', 'Partner'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1">
                  {(['existing', 'new'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPackageMode(m)}
                      className={cn(
                        'flex-1 rounded-md px-3 py-1.5 text-sm font-medium',
                        packageMode === m ? 'bg-white shadow-sm' : 'text-content-secondary',
                      )}
                    >
                      {m === 'existing' ? 'Use existing package' : 'Create new package'}
                    </button>
                  ))}
                </div>

                {packageMode === 'existing' ? (
                  <div>
                    <label className="mb-1 block text-xs text-content-secondary">Package</label>
                    <select
                      className="h-10 w-full rounded-md border border-border-base bg-white px-3 text-sm"
                      value={existingPackageId}
                      onChange={(e) => setExistingPackageId(e.target.value)}
                    >
                      <option value="">Select a package…</option>
                      {packages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.tier})
                        </option>
                      ))}
                    </select>
                    {selectedPackage && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-content-secondary">
                          Included modules ({selectedPackage.entitlements.modules.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {modules
                            .filter((m) => selectedPackage.entitlements.modules.includes(m.id))
                            .map((m) => (
                              <Badge key={m.id} variant="neutral">
                                {m.label}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-content-secondary">Package name</label>
                        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Custom" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-content-secondary">Tier</label>
                        <select
                          className="h-10 w-full rounded-md border border-border-base bg-white px-3 text-sm"
                          value={newTier}
                          onChange={(e) => setNewTier(e.target.value)}
                        >
                          {['standard', 'enterprise', 'premium'].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <PrivilegePicker
                      modules={modules}
                      privileges={privileges}
                      moduleIds={moduleIds}
                      privilegeIds={privilegeIds}
                      onToggleModule={toggleModule}
                      onTogglePrivilege={togglePrivilege}
                    />
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="mb-3 text-sm text-content-secondary">
                  Assign a module version to this client. Each client can run a different version.
                </p>
                <div className="space-y-2">
                  {versionModules.map((m) => {
                    const versions = m.versions
                    const latest = versions[versions.length - 1]
                    return (
                      <div key={m.id} className="flex items-center justify-between gap-2 rounded-md border border-border-base px-3 py-2">
                        <span className="text-sm font-medium">{m.label}</span>
                        <select
                          className="h-9 rounded-md border border-border-base bg-white px-2 text-sm"
                          value={effectiveVersionId(m.id)}
                          onChange={(e) => setVersionIds((prev) => ({ ...prev, [m.id]: e.target.value }))}
                        >
                          {versions.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.version}
                            </option>
                          ))}
                        </select>
                        {latest && versionIds[m.id] && versionIds[m.id] !== latest.id && (
                          <span className="text-[11px] text-amber-600">(not latest)</span>
                        )}
                      </div>
                    )
                  })}
                  {versionModules.length === 0 && (
                    <p className="text-sm text-content-secondary">No modules selected yet.</p>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-content-secondary">Admin name</label>
                  <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Client Admin" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-content-secondary">Admin email</label>
                  <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@client.com" />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3 text-sm">
                <ReviewRow label="Tenant" value={name} />
                <ReviewRow label="Type" value={type} />
                <ReviewRow
                  label="Package"
                  value={
                    packageMode === 'existing'
                      ? (selectedPackage?.name ?? '—')
                      : `${newName} (custom, ${moduleIds.length} modules)`
                  }
                />
                <ReviewRow
                  label="Module versions"
                  value={versionModules
                    .map((m) => {
                      const v = m.versions.find((x) => x.id === effectiveVersionId(m.id))
                      return `${m.label}@${v?.version ?? 'latest'}`
                    })
                    .join(', ')}
                />
                <ReviewRow label="Initial admin" value={`${adminName} <${adminEmail}>`} />
                <ReviewRow label="Default roles" value="Admin, Operational, Finance" />
              </div>
            )}

            {error && <p className="mt-3 rounded-md bg-surface-error px-3 py-2 text-sm text-content-error">{error}</p>}

            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                <ChevronLeft className="size-4" /> Back
              </Button>
              {step < 4 ? (
                <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                  Next <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button disabled={createTenant.isPending} onClick={submit}>
                  {createTenant.isPending ? 'Creating…' : 'Complete onboarding'}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-base pb-2 last:border-0">
      <span className="text-content-secondary">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
