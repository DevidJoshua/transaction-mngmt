import { Module } from '@nestjs/common'
import { ContextModule } from '../context/context.module'
import { BusinessService } from './business.service'
import { BusinessController } from './business.controller'

@Module({
  imports: [ContextModule],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
