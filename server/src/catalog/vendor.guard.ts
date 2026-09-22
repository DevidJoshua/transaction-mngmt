import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { RequestWithUser } from '../auth/jwt-auth.guard'
import { ContextService } from '../context/context.service'

@Injectable()
export class VendorGuard implements CanActivate {
  constructor(private readonly context: ContextService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>()
    const session = await this.context.resolve(req.user!.sub)
    if (!session?.isVendor) throw new ForbiddenException('Vendor only')
    return true
  }
}
