import { Landmark } from 'lucide-react'
import { Card, CardContent, Badge, PageHeader } from '../components/ui'
import { useSettlements } from '../lib/store'
import { formatIDR } from '../lib/utils'

const variant = { settled: 'success', pending: 'pending', failed: 'error' } as const

export function Settlement() {
  const { data: settlements = [] } = useSettlements()

  const total = settlements.reduce((sum, s) => sum + (s.status === 'settled' ? s.amount : 0), 0)
  const pending = settlements.filter((s) => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0)

  return (
    <div>
      <PageHeader title="Settlement" description="Payout summaries and settlement status." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent>
            <p className="text-sm text-content-secondary">Settled total</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{formatIDR(total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-content-secondary">Pending settlement</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{formatIDR(pending)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-base text-left text-xs text-content-secondary">
                <th className="px-5 py-3 font-medium">Period</th>
                <th className="px-5 py-3 font-medium">Merchant</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id} className="border-b border-border-base last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-content-secondary">{s.period}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Landmark className="size-4 text-content-secondary" />
                      <span className="font-medium">{s.merchant}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium">{formatIDR(s.amount)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={variant[s.status as keyof typeof variant] ?? 'neutral'}>{s.status}</Badge>
                  </td>
                </tr>
              ))}
              {settlements.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-content-secondary">
                    No settlements yet.
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
