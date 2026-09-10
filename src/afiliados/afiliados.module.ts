import { Module } from '@nestjs/common';
import { AfiliadosService } from './afiliados.service';
import { AfiliadosController } from './afiliados.controller';
import { IaService } from './ia.service';
import { IaController } from './ia.controller';
import { SqsModule } from 'src/aws/sqs/sqs.module';
import { IntegracaoController } from './integracao/integracao.controller';
import { IntegracaoService } from './integracao/integracao.service';

@Module({
  imports: [SqsModule],
  providers: [AfiliadosService, IaService, IntegracaoService],
  exports: [AfiliadosService],
  controllers: [AfiliadosController, IaController, IntegracaoController],
})
export class AfiliadosModule { }
