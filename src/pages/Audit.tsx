import { ShieldCheck } from 'lucide-react'
import { Card, CardContent, Badge, PageHeader } from '../components/ui'
import { useAudit } from '../lib/store'

const actionVariant: Record<string, 'success' | 'error' | 'brand' | 'neutral'> = {
  LOGIN: 'success',
  LOGIN_FAILED: 'error',
  PARTNER_CREATED: 'brand',
  PACKAGE_CREATED: 'brand',
  PACKAGE_UPDATED: 'brand',
  USER_CREATED: 'success',
  USER_UPDATED: 'neutral',
  ROLE_CREATED: 'success',
  ROLE_UPDATED: 'neutral',
  ORG_CREATED: 'success',
}

export function Audit() {
  const { data: logs = [] } = useAudit()

  return (
    <div>
      <PageHeader title="Audit" description="Authorization and administrative action trail." />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-base text-left text-xs text-content-secondary">
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Actor</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Target</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border-base last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-content-secondary">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-content-secondary" />
                      <span className="font-medium">{log.actor}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={actionVariant[log.action] ?? 'neutral'}>{log.action}</Badge>
                  </td>
                  <td className="px-5 py-3 text-content-secondary">{log.target ?? '—'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-content-secondary">
                    No audit events yet.
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
