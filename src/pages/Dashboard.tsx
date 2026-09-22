import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, PageHeader, Badge } from '../components/ui'
import { stats, transactions } from '../lib/mock'
import { formatIDR } from '../lib/utils'
import { useAbility } from '../lib/store'

const weekly = [
  { day: 'Mon', value: 4.2 },
  { day: 'Tue', value: 6.1 },
  { day: 'Wed', value: 5.0 },
  { day: 'Thu', value: 7.8 },
  { day: 'Fri', value: 6.4 },
  { day: 'Sat', value: 9.1 },
  { day: 'Sun', value: 7.2 },
]
const max = Math.max(...weekly.map((d) => d.value))

export function Dashboard() {
  const ctx = useAbility()
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your store's performance."
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border-base bg-slate-50 px-3 py-2 text-xs text-content-secondary">
        <span className="font-medium text-foreground">{ctx?.partner?.name ?? 'Partner'}</span>
        <span>·</span>
        <span>{ctx?.pkg?.name}</span>
        <span>·</span>
        <span>{ctx?.roles.map((r) => r.name).join(', ') || 'no role'}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent>
              <p className="text-sm text-content-secondary">{s.label}</p>
              <div className="mt-2 flex items-end justify-between">
                <p className="text-2xl font-semibold tracking-tight">
                  {s.label === 'Failed Rate' ? `${s.value}%` : formatIDR(s.value)}
                </p>
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    s.up ? 'text-content-success' : 'text-content-error'
                  }`}
                >
                  {s.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {s.delta}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <h3 className="text-base font-semibold">Weekly revenue</h3>
            <p className="text-sm text-content-secondary">Payments collected this week</p>
            <div className="mt-6 flex h-48 items-end gap-3">
              {weekly.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-surface-primary/80 transition-all"
                    style={{ height: `${(d.value / max) * 100}%` }}
                    title={`${d.value}M IDR`}
                  />
                  <span className="text-xs text-content-secondary">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-base font-semibold">Recent transactions</h3>
            <div className="mt-4 space-y-3">
              {transactions.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.customer}</p>
                    <p className="text-xs text-content-secondary">{t.method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatIDR(t.amount)}</p>
                    <Badge
                      variant={t.status === 'success' ? 'success' : t.status === 'failed' ? 'error' : 'pending'}
                    >
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}