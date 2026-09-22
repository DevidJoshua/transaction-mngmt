import { Module } from '@nestjs/common'
import { CatalogService } from './catalog.service'
import { CatalogController } from './catalog.controller'
import { VendorGuard } from './vendor.guard'
import { ContextModule } from '../context/context.module'

@Module({
  imports: [ContextModule],
  controllers: [CatalogController],
  providers: [CatalogService, VendorGuard],
})
export class CatalogModule {}
