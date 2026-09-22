import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, ReceiptText, Landmark, Link2, Store, BarChart3, Users, ShieldCheck,
  Boxes, LogOut, Zap, Building2,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { logout, useAbility, useLogin } from '../lib/store'

const ICONS: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard, ReceiptText, Landmark, Link2, Store, BarChart3, Users, ShieldCheck,
}

const DEMO = [
  { email: 'platform@plink.co.id', label: 'Platform Admin' },
]

export function AppShell() {
  const ctx = useAbility()
  const login = useLogin()

  if (!ctx) return null

  const items = ctx.isVendor
    ? [{ to: '/platform', label: 'Platform', icon: Boxes }]
    : ctx.catalog.modules
        .filter((m) => ctx.modules.includes(m.id))
        .map((m) => ({
          to: m.route,
          label: m.label,
          icon: ICONS[m.icon] ?? LayoutDashboard,
        }))

  function switchAccount(email: string) {
    login.mutate({ email, password: 'password123' })
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border-base bg-sidebar">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-surface-primary text-white">
            <Zap className="size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Prismalink</span>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface-primary/10 text-surface-primary'
                    : 'text-content-secondary hover:bg-slate-100 hover:text-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border-base p-4 space-y-3">
          <div className="flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-2">
            <Building2 className="size-4 text-content-secondary" />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                {ctx.isVendor ? 'Platform Operator' : ctx.tenant?.name}
              </p>
              <p className="truncate text-[11px] text-content-secondary">
                {ctx.isVendor ? 'Vendor' : ctx.pkg?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="h-9 w-full rounded-md border border-border-base bg-white px-2 text-xs"
              value={ctx.user.email}
              onChange={(e) => switchAccount(e.target.value)}
            >
              {DEMO.map((d) => (
                <option key={d.email} value={d.email}>
                  {d.label}
                </option>
              ))}
            </select>
            <button
              onClick={logout}
              className="rounded-md p-1.5 text-content-secondary hover:bg-slate-100 hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden bg-background">
        <div className="mx-auto max-w-6xl p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
