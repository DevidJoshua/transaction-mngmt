import { cn } from '../../lib/utils'

interface ModuleLike {
  id: string
  label: string
}

interface PrivilegeLike {
  id: string
  moduleId: string
  label: string
}

interface VersionLike {
  id: string
  version: string
}

export function PrivilegePicker({
  modules,
  privileges,
  moduleIds,
  privilegeIds,
  onToggleModule,
  onTogglePrivilege,
  versions,
  versionIds,
  onSelectVersion,
}: {
  modules: ModuleLike[]
  privileges: PrivilegeLike[]
  moduleIds: string[]
  privilegeIds: string[]
  onToggleModule: (id: string) => void
  onTogglePrivilege: (id: string) => void
  versions?: Record<string, VersionLike[]>
  versionIds?: Record<string, string>
  onSelectVersion?: (moduleId: string, versionId: string) => void
}) {
  return (
    <div className="space-y-2">
      {modules.map((m) => {
        const checked = moduleIds.includes(m.id)
        const modPrivs = privileges.filter((p) => p.moduleId === m.id)
        const modVersions = versions?.[m.id] ?? []
        return (
          <div key={m.id} className={cn('rounded-md border', checked ? 'border-border-active' : 'border-border-base')}>
            <div className="flex items-center gap-2 px-3 py-2">
              <label className="flex flex-1 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleModule(m.id)}
                  className="accent-surface-primary"
                />
                <span className="text-sm font-medium">{m.label}</span>
              </label>
              {checked && onSelectVersion && modVersions.length > 0 && (
                <select
                  className="h-8 rounded-md border border-border-base bg-white px-2 text-xs"
                  value={versionIds?.[m.id] ?? ''}
                  onChange={(e) => onSelectVersion(m.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {modVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.version}
                    </option>
                  ))}
                </select>
              )}
              <span className="text-xs text-content-secondary">{modPrivs.length} priv</span>
            </div>
            {checked && modPrivs.length > 0 && (
              <div className="grid gap-1 border-t border-border-base px-3 py-2 sm:grid-cols-2">
                {modPrivs.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 rounded px-1 py-1 text-sm hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={privilegeIds.includes(p.id)}
                      onChange={() => onTogglePrivilege(p.id)}
                      className="accent-surface-primary"
                    />
                    <span className="flex-1">{p.label}</span>
                    <span className="text-[11px] text-content-secondary">{p.id}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
