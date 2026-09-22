import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RequestWithUser } from '../auth/jwt-auth.guard'
import { ContextService } from './context.service'
import { REQUIRE_PRIVILEGE_KEY } from './privileges.decorator'

@Injectable()
export class PrivilegesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly context: ContextService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRE_PRIVILEGE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])
    if (!required || required.length === 0) return true

    const req = ctx.switchToHttp().getRequest<RequestWithUser>()
    const session = await this.context.resolve(req.user!.sub)
    if (!session) throw new ForbiddenException()

    if (session.isVendor) return true
    if (session.user.status !== 'active') throw new ForbiddenException()

    const has = required.some((p) => session.privileges.includes(p))
    if (!has) throw new ForbiddenException('Missing privilege')
    return true
  }
}
