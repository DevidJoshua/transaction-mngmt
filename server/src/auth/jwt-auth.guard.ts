import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { AuthService, JwtPayload } from './auth.service'

export interface RequestWithUser extends Request {
  user?: JwtPayload
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>()
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token')
    }
    try {
      req.user = this.auth.verify(header.slice(7))
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
    return true
  }
}
