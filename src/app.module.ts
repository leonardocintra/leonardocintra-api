import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LampModule } from './automations/lamp/lamp.module';

@Module({
  imports: [LampModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
