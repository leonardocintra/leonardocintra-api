import { Module } from '@nestjs/common';
import { PortaoService } from './portao.service';
import { PortaoController } from './portao.controller';

@Module({
  controllers: [PortaoController],
  providers: [PortaoService],
})
export class PortaoModule {}
