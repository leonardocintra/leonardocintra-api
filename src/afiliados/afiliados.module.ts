import { Module } from '@nestjs/common';
import { AfiliadosService } from './afiliados.service';

@Module({
  providers: [AfiliadosService],
  exports: [AfiliadosService],
})
export class AfiliadosModule { }
