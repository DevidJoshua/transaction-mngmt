import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { AuditService } from '../audit/audit.service'

export interface JwtPayload {
  sub: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await this.audit.log({ actor: email, action: 'LOGIN_FAILED', detail: 'invalid credentials' })
      throw new UnauthorizedException('Invalid email or password')
    }
    if (user.status !== 'active') {
      await this.audit.log({ actor: user.email, action: 'LOGIN_FAILED', partnerId: user.partnerId, detail: `status=${user.status}` })
      throw new UnauthorizedException('This account is not active')
    }
    await this.audit.log({ actor: user.email, action: 'LOGIN', partnerId: user.partnerId })
    const token = await this.jwt.signAsync({ sub: user.id } satisfies JwtPayload)
    return { token }
  }

  verify(token: string): JwtPayload {
    return this.jwt.verify(token) as JwtPayload
  }
}
