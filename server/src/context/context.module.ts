import { Module } from '@nestjs/common'
import { ContextService } from './context.service'
import { ContextController } from './context.controller'
import { PrivilegesGuard } from './privileges.guard'

@Module({
  controllers: [ContextController],
  providers: [ContextService, PrivilegesGuard],
  exports: [ContextService, PrivilegesGuard],
})
export class ContextModule {}
