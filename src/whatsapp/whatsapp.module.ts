import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AwsModule } from 'src/aws/aws.module';
import { MensagemService } from './mensagem/mensagem.service';
import { MensagemController } from './mensagem/mensagem.controller';
import { AfiliadosModule } from 'src/afiliados/afiliados.module';

@Module({
  imports: [AwsModule, HttpModule, AfiliadosModule],
  providers: [MensagemService],
  controllers: [MensagemController],
  exports: [MensagemService],
})
export class WhatsappModule { }
