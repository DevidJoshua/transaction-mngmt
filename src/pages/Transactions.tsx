import { useMemo, useState } from 'react'
import { Search, Download, Undo2 } from 'lucide-react'
import { Card, CardContent, Badge, Input, PageHeader, Button } from '../components/ui'
import { transactions } from '../lib/mock'
import { formatIDR } from '../lib/utils'
import { Can } from '../components/Can'
import { useAbility, useOrgs } from '../lib/store'

const statusVariant = {
  success: 'success',
  pending: 'pending',
  failed: 'error',
} as const

export function Transactions() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'success' | 'pending' | 'failed'>('all')
  const [refunded, setRefunded] = useState<Set<string>>(new Set())
  const ctx = useAbility()
  const { data: orgs = [] } = useOrgs()

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesQuery =
        !query ||
        t.customer.toLowerCase().includes(query.toLowerCase()) ||
        t.reference.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'all' || t.status === status
      return matchesQuery && matchesStatus
    })
  }, [query, status])

  const scopeNames = (ctx?.orgIds ?? []).map((id) => orgs.find((o) => o.id === id)?.name).filter(Boolean)

  function refund(id: string) {
    setRefunded((prev) => new Set(prev).add(id))
  }

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Track every payment across your stores."
      >
        <Can i="TRANSACTION_EXPORT">
          <Button variant="outline" onClick={() => {}}>
            <Download className="size-4" /> Export
          </Button>
        </Can>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border-base bg-slate-50 px-3 py-2 text-xs text-content-secondary">
        <span className="font-medium text-foreground">Active as:</span>
        <span>{ctx?.user.name}</span>
        <span>·</span>
        <span>{ctx?.roles.map((r) => r.name).join(', ') || 'no role'}</span>
        {scopeNames.length > 0 && (
          <>
            <span>·</span>
            <span>Scope: {scopeNames.join(', ')}</span>
          </>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-secondary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference or customer…"
            className="pl-9"
          />
        </div>
        {(['all', 'success', 'pending', 'failed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={
              status === s
                ? 'rounded-full bg-primary px-3 py-1.5 text-sm font-medium capitalize text-primary-foreground'
                : 'rounded-full bg-white px-3 py-1.5 text-sm font-medium capitalize text-content-secondary hover:bg-slate-100'
            }
          >
            {s}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-base text-left text-xs text-content-secondary">
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const isRefunded = refunded.has(t.id)
                return (
                  <tr key={t.id} className="border-b border-border-base last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs">{t.reference}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{t.customer}</p>
                      <p className="text-xs text-content-secondary">{t.store}</p>
                    </td>
                    <td className="px-5 py-3 text-content-secondary">{t.method}</td>
                    <td className="px-5 py-3 font-medium">{formatIDR(t.amount)}</td>
                    <td className="px-5 py-3">
                      {isRefunded ? (
                        <Badge variant="error">refunded</Badge>
                      ) : (
                        <Badge variant={statusVariant[t.status]}>{t.status}</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-content-secondary">{t.time}</td>
                    <td className="px-5 py-3 text-right">
                      {!isRefunded && t.status === 'success' && (
                        <Can i="TRANSACTION_REFUND">
                          <button
                            onClick={() => refund(t.id)}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-content-error hover:bg-surface-error"
                          >
                            <Undo2 className="size-3.5" /> Refund
                          </button>
                        </Can>
                      )}
                      <Can i="TRANSACTION_VOID">
                        {t.status === 'pending' && (
                          <button className="ml-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-content-secondary hover:bg-slate-100">
                            Void
                          </button>
                        )}
                      </Can>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-content-secondary">
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}