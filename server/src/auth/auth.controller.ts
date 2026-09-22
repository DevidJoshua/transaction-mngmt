import { Body, Controller, Post } from '@nestjs/common'
import { IsEmail, IsString } from 'class-validator'
import { AuthService } from './auth.service'

class LoginDto {
  @IsEmail()
  email!: string

  @IsString()
  password!: string
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password)
  }
}
