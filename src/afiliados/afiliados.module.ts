import { Module } from '@nestjs/common';
import { AfiliadosService } from './afiliados.service';
import { AfiliadosController } from './afiliados.controller';
import { SqsModule } from 'src/aws/sqs/sqs.module';

@Module({
  imports: [SqsModule],
  providers: [AfiliadosService],
  exports: [AfiliadosService],
  controllers: [AfiliadosController],
})
export class AfiliadosModule { }
