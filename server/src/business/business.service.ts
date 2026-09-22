import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  private async userScope(userId: string) {
    const u = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userScopes: true },
    })
    return {
      partnerId: u?.partnerId ?? null,
      isVendor: u?.isVendor ?? false,
      orgIds: u?.userScopes?.map((s) => s.orgId) ?? [],
    }
  }

  async listMerchants(userId: string) {
    const { partnerId, orgIds } = await this.userScope(userId)
    if (!partnerId) return []
    return this.prisma.merchant.findMany({
      where: { partnerId, OR: [{ orgId: null }, { orgId: { in: orgIds } }] },
      orderBy: { name: 'asc' },
    })
  }

  async createMerchant(userId: string, dto: { name: string; category?: string; orgId?: string }) {
    const { partnerId } = await this.userScope(userId)
    if (!partnerId) throw new BadRequestException('No partner context')
    return this.prisma.merchant.create({
      data: {
        id: 'merchant-' + Date.now(),
        partnerId,
        orgId: dto.orgId ?? null,
        name: dto.name,
        category: dto.category ?? null,
      },
    })
  }

  async listSettlements(userId: string) {
    const { partnerId, orgIds } = await this.userScope(userId)
    if (!partnerId) return []
    return this.prisma.settlement.findMany({
      where: { partnerId, OR: [{ orgId: null }, { orgId: { in: orgIds } }] },
      orderBy: { createdAt: 'desc' },
    })
  }

  async listAudit(userId: string) {
    const { partnerId, isVendor } = await this.userScope(userId)
    return this.prisma.auditLog.findMany({
      where: isVendor ? {} : { partnerId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
  }
}
