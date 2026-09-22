import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  private async userTenant(userId: string) {
    const u = await this.prisma.user.findUnique({ where: { id: userId } })
    return { tenantId: u?.tenantId ?? null, isVendor: u?.isVendor ?? false }
  }

  async listMerchants(userId: string) {
    const { tenantId } = await this.userTenant(userId)
    if (!tenantId) return []
    return this.prisma.merchant.findMany({ where: { tenantId }, orderBy: { name: 'asc' } })
  }

  async createMerchant(userId: string, dto: { name: string; category?: string }) {
    const { tenantId } = await this.userTenant(userId)
    if (!tenantId) throw new BadRequestException('No tenant context')
    return this.prisma.merchant.create({
      data: { id: 'merchant-' + Date.now(), tenantId, name: dto.name, category: dto.category ?? null },
    })
  }

  async listSettlements(userId: string) {
    const { tenantId } = await this.userTenant(userId)
    if (!tenantId) return []
    return this.prisma.settlement.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } })
  }

  async listAudit(userId: string) {
    const { tenantId, isVendor } = await this.userTenant(userId)
    return this.prisma.auditLog.findMany({
      where: isVendor ? {} : { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  }
}
