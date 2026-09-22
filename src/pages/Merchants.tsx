import { useState } from 'react'
import { Plus, Store } from 'lucide-react'
import { Card, CardContent, Badge, Button, Input, PageHeader } from '../components/ui'
import { useCreateMerchant, useMerchants } from '../lib/store'
import { Can } from '../components/Can'

export function Merchants() {
  const { data: merchants = [] } = useMerchants()
  const createMerchant = useCreateMerchant()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')

  return (
    <div>
      <PageHeader title="Merchants" description="Merchant accounts under your organization." />

      <Can i="MERCHANT_MANAGE">
        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-end gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-content-secondary">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Merchant name" />
            </div>
            <div className="w-48">
              <label className="mb-1 block text-xs text-content-secondary">Category</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="F&B, Retail…" />
            </div>
            <Button
              disabled={!name || createMerchant.isPending}
              onClick={() => {
                createMerchant.mutate({ name, category: category || undefined })
                setName('')
                setCategory('')
              }}
            >
              <Plus className="size-4" /> Add merchant
            </Button>
          </CardContent>
        </Card>
      </Can>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-base text-left text-xs text-content-secondary">
                <th className="px-5 py-3 font-medium">Merchant</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((m) => (
                <tr key={m.id} className="border-b border-border-base last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Store className="size-4 text-content-secondary" />
                      <span className="font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-content-secondary">{m.category ?? '—'}</td>
                  <td className="px-5 py-3">
                    <Badge variant={m.status === 'active' ? 'success' : 'neutral'}>{m.status}</Badge>
                  </td>
                </tr>
              ))}
              {merchants.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-content-secondary">
                    No merchants yet.
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
