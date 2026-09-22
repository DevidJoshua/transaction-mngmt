import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard, RequestWithUser } from '../auth/jwt-auth.guard'
import { ContextService } from './context.service'

@Controller('context')
@UseGuards(JwtAuthGuard)
export class ContextController {
  constructor(private readonly context: ContextService) {}

  @Get()
  async me(@Req() req: RequestWithUser) {
    return this.context.resolve(req.user!.sub)
  }
}
