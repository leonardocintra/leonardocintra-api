import { Module } from '@nestjs/common';
import { LampService } from './lamp.service';
import { LampController } from './lamp.controller';

@Module({
  controllers: [LampController],
  providers: [LampService],
  exports: [LampService],
})
export class LampModule {}
