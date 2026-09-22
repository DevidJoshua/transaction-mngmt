import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { IsOptional, IsString } from 'class-validator'
import { JwtAuthGuard, RequestWithUser } from '../auth/jwt-auth.guard'
import { RequirePrivilege } from '../context/privileges.decorator'
import { PrivilegesGuard } from '../context/privileges.guard'
import { BusinessService } from './business.service'

class CreateMerchantDto {
  @IsString() name!: string
  @IsOptional() @IsString() category?: string
}

@Controller()
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(private readonly business: BusinessService) {}

  @Get('merchants')
  @UseGuards(PrivilegesGuard)
  @RequirePrivilege('MERCHANT_VIEW')
  listMerchants(@Req() req: RequestWithUser) {
    return this.business.listMerchants(req.user!.sub)
  }

  @Post('merchants')
  @UseGuards(PrivilegesGuard)
  @RequirePrivilege('MERCHANT_MANAGE')
  createMerchant(@Req() req: RequestWithUser, @Body() dto: CreateMerchantDto) {
    return this.business.createMerchant(req.user!.sub, dto)
  }

  @Get('settlements')
  @UseGuards(PrivilegesGuard)
  @RequirePrivilege('SETTLEMENT_VIEW')
  listSettlements(@Req() req: RequestWithUser) {
    return this.business.listSettlements(req.user!.sub)
  }

  @Get('audit')
  @UseGuards(PrivilegesGuard)
  @RequirePrivilege('AUDIT_VIEW')
  listAudit(@Req() req: RequestWithUser) {
    return this.business.listAudit(req.user!.sub)
  }
}
