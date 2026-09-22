import type { ReactNode } from 'react'
import { useAbility } from '../lib/store'
import { can } from '../lib/platform'

export function useCan() {
  const ctx = useAbility()
  return (privilege: string) => can(ctx, privilege)
}

export function Can({ i, children, fallback = null }: { i: string; children: ReactNode; fallback?: ReactNode }) {
  const canDo = useCan()
  return <>{canDo(i) ? children : fallback}</>
}