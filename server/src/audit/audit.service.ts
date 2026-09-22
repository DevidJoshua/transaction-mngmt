import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface AuditEntry {
  partnerId?: string | null
  actor: string
  action: string
  target?: string | null
  detail?: string | null
  ip?: string | null
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditEntry) {
    try {
      await this.prisma.auditLog.create({
        data: {
          partnerId: entry.partnerId ?? null,
          actor: entry.actor,
          action: entry.action,
          target: entry.target ?? null,
          detail: entry.detail ?? null,
          ip: entry.ip ?? null,
        },
      })
    } catch {
      // audit logging must never break the primary operation
    }
  }
}
