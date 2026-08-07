import { Module } from '@nestjs/common';
import { AfiliadosService } from './afiliados.service';
import { AfiliadosController } from './afiliados.controller';

@Module({
  providers: [AfiliadosService],
  exports: [AfiliadosService],
  controllers: [AfiliadosController],
})
export class AfiliadosModule { }
