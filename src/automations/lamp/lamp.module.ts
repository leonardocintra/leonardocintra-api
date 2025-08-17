import { Module } from '@nestjs/common';
import { LampService } from './lamp.service';
import { LampController } from './lamp.controller';

@Module({
  controllers: [LampController],
  providers: [LampService],
})
export class LampModule {}
