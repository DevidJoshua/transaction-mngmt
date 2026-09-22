import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuditModule } from './audit/audit.module'
import { AuthModule } from './auth/auth.module'
import { ContextModule } from './context/context.module'
import { CatalogModule } from './catalog/catalog.module'
import { AdminModule } from './admin/admin.module'
import { BusinessModule } from './business/business.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    AuthModule,
    ContextModule,
    CatalogModule,
    AdminModule,
    BusinessModule,
  ],
})
export class AppModule {}
