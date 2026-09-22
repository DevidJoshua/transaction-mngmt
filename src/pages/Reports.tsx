import { Download } from 'lucide-react'
import { Card, CardContent, Badge, Button, PageHeader } from '../components/ui'
import { useMerchants, useSettlements } from '../lib/store'
import { formatIDR } from '../lib/utils'
import { Can } from '../components/Can'

export function Reports() {
  const { data: settlements = [] } = useSettlements()
  const { data: merchants = [] } = useMerchants()

  const settled = settlements.filter((s) => s.status === 'settled')
  const total = settled.reduce((sum, s) => sum + s.amount, 0)
  const byMerchant = new Map<string, number>()
  for (const s of settled) byMerchant.set(s.merchant, (byMerchant.get(s.merchant) ?? 0) + s.amount)

  function exportCSV() {
    const rows = [
      ['Merchant', 'Period', 'Status', 'Amount'],
      ...settlements.map((s) => [s.merchant, s.period, s.status, String(s.amount)]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'settlement-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader title="Reports" description="Settlement and performance summaries.">
        <Can i="REPORT_EXPORT">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="size-4" /> Export CSV
          </Button>
        </Can>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-sm text-content-secondary">Total settled</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{formatIDR(total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-content-secondary">Settlements</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{settled.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-content-secondary">Merchants</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{merchants.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <h3 className="text-base font-semibold">Settled by merchant</h3>
          <div className="mt-4 space-y-2">
            {[...byMerchant.entries()].map(([merchant, amount]) => (
              <div key={merchant} className="flex items-center justify-between text-sm">
                <span className="font-medium">{merchant}</span>
                <span className="flex items-center gap-2">
                  {formatIDR(amount)}
                  <Badge variant="success">settled</Badge>
                </span>
              </div>
            ))}
            {byMerchant.size === 0 && (
              <p className="text-sm text-content-secondary">No settled data yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
