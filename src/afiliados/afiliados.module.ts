import { Module } from '@nestjs/common';
import { AfiliadosService } from './afiliados.service';
import { AfiliadosController } from './afiliados.controller';
import { IaService } from './ia.service';
import { IaController } from './ia.controller';
import { SqsModule } from 'src/aws/sqs/sqs.module';
import { IntegracaoController } from './integracao/integracao.controller';

@Module({
  imports: [SqsModule],
  providers: [AfiliadosService, IaService],
  exports: [AfiliadosService],
  controllers: [AfiliadosController, IaController, IntegracaoController],
})
export class AfiliadosModule { }
