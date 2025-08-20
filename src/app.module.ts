import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LampModule } from './automations/lamp/lamp.module';
import { PortaoModule } from './automations/portao/portao.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LampModule,
    PortaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
