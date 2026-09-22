import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator'
import { JwtAuthGuard, RequestWithUser } from '../auth/jwt-auth.guard'
import { RequirePrivilege } from '../context/privileges.decorator'
import { PrivilegesGuard } from '../context/privileges.guard'
import { AdminService } from './admin.service'

class CreateUserDto {
  @IsString() name!: string
  @IsEmail() email!: string
  @IsOptional() @IsString() password?: string
}

class UpdateUserDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsEmail() email?: string
  @IsOptional() @IsString() status?: string
  @IsOptional() @IsArray() roleIds?: string[]
  @IsOptional() @IsArray() orgIds?: string[]
}

class CreateRoleDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsArray() privilegeIds?: string[]
}

class UpdateRoleDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsString() status?: string
  @IsOptional() @IsArray() privilegeIds?: string[]
}

class CreateOrgDto {
  @IsString() name!: string
  @IsOptional() @IsString() parentId?: string
}

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  @UseGuards(PrivilegesGuard)
  @RequirePrivilege('USER_VIEW')
  listUsers(@Req() req: RequestWithUser) {
    return this.admin.listUsers(req.user!.sub)
  }

  @Post('users')
  @UseGuards(PrivilegesGuard)
  @RequirePrivilege('USER_MANAGE')
  createUser(@Req() req: RequestWithUser, @Body() dto: CreateUserDto) {
    return this.admin.createUser(req.user!.sub, dto)
  }

  @Patch('users/:id')
  @UseGuards(PrivilegesGuard)
  @RequirePrivilege('USER_MANAGE')
  updateUser(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.admin.updateUser(req.user!.sub, id, dto)
  }

  @Get('roles')
  @UseGuards(PrivilegesGuard)
  @RequirePrivilege('ROLE_VIEW')
  listRoles(@Req() req: RequestWithUser) {
    return this.admin.listRoles(req.user!.sub)
  }

  @Post('roles')
  @UseGuards(PrivilegesGuard)
  @RequirePrivilege('ROLE_MANAGE')
  createRole(@Req() req: RequestWithUser, @Body() dto: CreateRoleDto) {
    return this.admin.createRole(req.user!.sub, dto)
  }

  @Patch('roles/:id')
  @UseGuards(PrivilegesGuard)
  @RequirePrivilege('ROLE_MANAGE')
  updateRole(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.admin.updateRole(req.user!.sub, id, dto)
  }

  @Get('orgs')
  @UseGuards(PrivilegesGuard)
  @RequirePrivilege('USER_VIEW')
  listOrgs(@Req() req: RequestWithUser) {
    return this.admin.listOrgs(req.user!.sub)
  }

  @Post('orgs')
  @UseGuards(PrivilegesGuard)
  @RequirePrivilege('USER_MANAGE')
  createOrg(@Req() req: RequestWithUser, @Body() dto: CreateOrgDto) {
    return this.admin.createOrg(req.user!.sub, dto)
  }
}
