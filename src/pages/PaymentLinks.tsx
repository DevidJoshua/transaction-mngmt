import { useState } from 'react'
import { Plus, Link2, Copy, Check } from 'lucide-react'
import { Button, Card, CardContent, Badge, Input, PageHeader } from '../components/ui'
import { paymentLinks, type PaymentLink } from '../lib/mock'
import { formatIDR } from '../lib/utils'

export function PaymentLinks() {
  const [links, setLinks] = useState(paymentLinks)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  function create() {
    const newLink: PaymentLink = {
      id: String(Date.now()),
      name: name || 'Untitled link',
      url: 'plink.id/' + name.toLowerCase().replace(/\s+/g, '-'),
      amount: Number(amount) || 0,
      status: 'active',
      paid: 0,
      created: new Date().toISOString().slice(0, 10),
    }
    setLinks((prev) => [newLink, ...prev])
    setName('')
    setAmount('')
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Payment Links"
        description="Create and share payment links with your customers."
      >
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New link
        </Button>
      </PageHeader>

      {open && (
        <Card className="mb-6">
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Link name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Coffee Bundle"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Amount (IDR)</label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="65000"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={create}>Create link</Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-base text-left text-xs text-content-secondary">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">URL</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Paid</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="border-b border-border-base last:border-0">
                  <td className="px-5 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      <Link2 className="size-4 text-content-secondary" />
                      {l.name}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-content-secondary">{l.url}</td>
                  <td className="px-5 py-3">{formatIDR(l.amount)}</td>
                  <td className="px-5 py-3">{l.paid}</td>
                  <td className="px-5 py-3">
                    <Badge variant={l.status === 'active' ? 'success' : 'neutral'}>
                      {l.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(l.url)
                        setCopied(l.id)
                        setTimeout(() => setCopied(null), 1500)
                      }}
                      className="inline-flex items-center gap-1 text-xs text-content-secondary hover:text-foreground"
                    >
                      {copied === l.id ? (
                        <>
                          <Check className="size-4 text-content-success" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" /> Copy
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}