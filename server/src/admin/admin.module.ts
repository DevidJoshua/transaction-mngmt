import { Module } from '@nestjs/common'
import { AdminService } from './admin.service'
import { AdminController } from './admin.controller'
import { ContextModule } from '../context/context.module'

@Module({
  imports: [ContextModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
