import { Fragment, useEffect, useState } from 'react'
import { Boxes, Package, Building2, Plus, BarChart3 } from 'lucide-react'
import { Card, CardContent, PageHeader, Badge, Button, Input } from '../components/ui'
import { useCatalog, useCreateModuleVersion, useCreateModule, useCreatePrivilege } from '../lib/store'
import { PackageManager } from './platform/PackageManager'
import { PartnerWizard } from './platform/PartnerWizard'
import { cn } from '../lib/utils'

type Tab = 'modules' | 'packages' | 'partners' | 'report'

const tabs: { id: Tab; label: string; icon: typeof Boxes }[] = [
  { id: 'modules', label: 'Modules & Privileges', icon: Boxes },
  { id: 'packages', label: 'Packages', icon: Package },
  { id: 'partners', label: 'Partners & Onboarding', icon: Building2 },
  { id: 'report', label: 'Entitlement Matrix', icon: BarChart3 },
]

export function Platform() {
  const [tab, setTab] = useState<Tab>('modules')

  return (
    <div>
      <PageHeader
        title="Platform Administration"
        description="Vendor-controlled capability catalog, packages, and client onboarding."
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

      {tab === 'modules' ? (
        <Modules />
      ) : tab === 'packages' ? (
        <PackageManager />
      ) : tab === 'report' ? (
        <EntitlementMatrix />
      ) : (
        <div className="space-y-4">
          <PartnerWizard />
          <PartnersOverview />
        </div>
      )}
    </div>
  )
}

function PartnersOverview() {
  const { data } = useCatalog()
  const partners = data?.partners ?? []

  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-5 py-3 text-sm font-semibold">Existing partners</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-base text-left text-xs text-content-secondary">
              <th className="px-5 py-3 font-medium">Partner</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Package</th>
              <th className="px-5 py-3 font-medium">Module versions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((t) => (
              <tr key={t.id} className="border-b border-border-base last:border-0">
                <td className="px-5 py-3">
                  <p className="font-medium">{t.name}</p>
                  <p className="font-mono text-xs text-content-secondary">{t.id}</p>
                </td>
                <td className="px-5 py-3 text-content-secondary">{t.type}</td>
                <td className="px-5 py-3">
                  <Badge variant="brand">{t.packageName}</Badge>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {t.moduleVersions.map((mv) => (
                      <Badge key={mv.moduleId} variant="neutral">
                        {mv.moduleId}@{mv.version}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function Modules() {
  const { data } = useCatalog()
  const modules = data?.modules ?? []
  const privileges = data?.privileges ?? []

  return (
    <div className="space-y-4">
      <CatalogForms modules={modules} />

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((m) => {
          const privs = privileges.filter((p) => p.moduleId === m.id)
          const features = [...new Set(privs.map((p) => p.feature))]
          return (
            <Card key={m.id}>
              <CardContent>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold">{m.label}</h3>
                  <Badge variant="neutral">{privs.length} privileges</Badge>
                </div>

                <VersionRow moduleId={m.id} label={m.label} versions={m.versions.map((v) => v.version)} />

                <div className="space-y-3">
                  {features.map((f) => (
                    <div key={f}>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-content-secondary">{f}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {privs
                          .filter((p) => p.feature === f)
                          .map((p) => (
                            <span
                              key={p.id}
                              className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-content-secondary"
                            >
                              {p.id}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function CatalogForms({ modules }: { modules: { id: string; label: string }[] }) {
  const [tab, setTab] = useState<'module' | 'privilege'>('module')
  const createModule = useCreateModule()
  const createPrivilege = useCreatePrivilege()

  const [label, setLabel] = useState('')
  const [route, setRoute] = useState('')
  const [moduleId, setModuleId] = useState(modules[0]?.id ?? '')
  const [feature, setFeature] = useState('')
  const [privLabel, setPrivLabel] = useState('')

  useEffect(() => {
    if (!moduleId && modules[0]) setModuleId(modules[0].id)
  }, [modules, moduleId])

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1">
          {(['module', 'privilege'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium',
                tab === t ? 'bg-white shadow-sm' : 'text-content-secondary',
              )}
            >
              {t === 'module' ? 'Add module' : 'Add privilege'}
            </button>
          ))}
        </div>

        {tab === 'module' ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-content-secondary">Label</label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Dispute" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-content-secondary">Route</label>
              <Input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="/disputes" />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                disabled={!label || createModule.isPending}
                onClick={() => {
                  createModule.mutate({ label, route, icon: 'Boxes' })
                  setLabel('')
                  setRoute('')
                }}
              >
                <Plus className="size-4" /> Add module
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs text-content-secondary">Module</label>
              <select
                className="h-10 w-full rounded-md border border-border-base bg-white px-3 text-sm"
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-content-secondary">Feature</label>
              <Input value={feature} onChange={(e) => setFeature(e.target.value)} placeholder="e.g. Dispute" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-content-secondary">Label</label>
              <Input value={privLabel} onChange={(e) => setPrivLabel(e.target.value)} placeholder="e.g. Manage dispute" />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full"
                disabled={!moduleId || !feature || !privLabel || createPrivilege.isPending}
                onClick={() => {
                  createPrivilege.mutate({ moduleId, feature, label: privLabel })
                  setFeature('')
                  setPrivLabel('')
                }}
              >
                <Plus className="size-4" /> Add privilege
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function VersionRow({ moduleId, label, versions }: { moduleId: string; label: string; versions: string[] }) {
  const createVersion = useCreateModuleVersion()
  const [next, setNext] = useState('')

  return (
    <div className="mb-3 rounded-md border border-border-base bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-content-secondary">Versions:</span>
        <div className="flex flex-wrap gap-1">
          {versions.map((v) => (
            <Badge key={v} variant={v === versions[versions.length - 1] ? 'brand' : 'neutral'}>
              {v}
            </Badge>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Input
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="e.g. v3"
          className="h-8 text-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && next) {
              createVersion.mutate({ moduleId, version: next })
              setNext('')
            }
          }}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={!next || createVersion.isPending}
          onClick={() => {
            createVersion.mutate({ moduleId, version: next })
            setNext('')
          }}
        >
          <Plus className="size-3.5" /> Add
        </Button>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
}

function EntitlementMatrix() {
  const { data } = useCatalog()
  const modules = data?.modules ?? []
  const privileges = data?.privileges ?? []
  const packages = data?.packages ?? []

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-base text-left text-xs text-content-secondary">
                <th className="px-5 py-3 font-medium">Module / Privilege</th>
                {packages.map((p) => (
                  <th key={p.id} className="px-3 py-3 text-center font-medium">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((m) => {
                const privs = privileges.filter((p) => p.moduleId === m.id)
                return (
                  <Fragment key={m.id}>
                    <tr className="border-b border-border-base bg-slate-50">
                      <td className="px-5 py-2 font-semibold">{m.label}</td>
                      {packages.map((p) => (
                        <td key={p.id} className="px-3 py-2 text-center">
                          {p.entitlements.modules.includes(m.id) ? (
                            <span className="text-surface-primary">✓</span>
                          ) : (
                            <span className="text-content-secondary">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                    {privs.map((pr) => (
                      <tr key={pr.id} className="border-b border-border-base last:border-0">
                        <td className="px-5 py-2 pl-8 text-content-secondary">
                          {pr.label}
                          <span className="ml-2 font-mono text-[11px] text-content-secondary">{pr.id}</span>
                        </td>
                        {packages.map((p) => (
                          <td key={p.id} className="px-3 py-2 text-center">
                            {p.entitlements.privileges.includes(pr.id) ? (
                              <span className="text-surface-primary">✓</span>
                            ) : (
                              <span className="text-content-secondary">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
