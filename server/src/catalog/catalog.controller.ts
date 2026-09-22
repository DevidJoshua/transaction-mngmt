import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { IsArray, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { JwtAuthGuard, RequestWithUser } from '../auth/jwt-auth.guard'
import { VendorGuard } from './vendor.guard'
import { CatalogService } from './catalog.service'

class ModuleVersionDto {
  @IsString() moduleId!: string
  @IsString() versionId!: string
}

class CreatePartnerDto {
  @IsString() name!: string
  @IsString() type!: string
  @IsString() packageId!: string
  @IsString() adminName!: string
  @IsEmail() adminEmail!: string
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ModuleVersionDto)
  moduleVersions?: ModuleVersionDto[]
}

class CreatePackageDto {
  @IsString() name!: string
  @IsString() tier!: string
  @IsArray() moduleIds!: string[]
  @IsArray() privilegeIds!: string[]
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ModuleVersionDto)
  moduleVersions?: ModuleVersionDto[]
}

class UpdatePackageDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsString() tier?: string
  @IsOptional() @IsArray() moduleIds?: string[]
  @IsOptional() @IsArray() privilegeIds?: string[]
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ModuleVersionDto)
  moduleVersions?: ModuleVersionDto[]
}

class CreateModuleVersionDto {
  @IsString() version!: string
}

class CreateModuleDto {
  @IsString() label!: string
  @IsOptional() @IsString() route?: string
  @IsOptional() @IsString() icon?: string
}

class CreatePrivilegeDto {
  @IsString() moduleId!: string
  @IsString() feature!: string
  @IsString() label!: string
}

@Controller('catalog')
@UseGuards(JwtAuthGuard, VendorGuard)
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  findAll() {
    return this.catalog.getCatalog()
  }

  @Post('partners')
  createPartner(@Req() req: RequestWithUser, @Body() dto: CreatePartnerDto) {
    return this.catalog.createPartner(dto, req.user!.sub)
  }

  @Post('packages')
  createPackage(@Req() req: RequestWithUser, @Body() dto: CreatePackageDto) {
    return this.catalog.createPackage(dto, req.user!.sub)
  }

  @Patch('packages/:id')
  updatePackage(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.catalog.updatePackage(id, dto, req.user!.sub)
  }

  @Post('modules/:id/versions')
  createModuleVersion(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: CreateModuleVersionDto) {
    return this.catalog.createModuleVersion(id, dto.version, req.user!.sub)
  }

  @Post('modules')
  createModule(@Req() req: RequestWithUser, @Body() dto: CreateModuleDto) {
    return this.catalog.createModule(
      { label: dto.label, route: dto.route ?? `/${dto.label.toLowerCase().replace(/\s+/g, '-')}`, icon: dto.icon ?? 'Boxes' },
      req.user!.sub,
    )
  }

  @Post('privileges')
  createPrivilege(@Req() req: RequestWithUser, @Body() dto: CreatePrivilegeDto) {
    return this.catalog.createPrivilege(dto, req.user!.sub)
  }
}
