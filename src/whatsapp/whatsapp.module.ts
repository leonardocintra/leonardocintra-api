import { Module } from '@nestjs/common';
import { MensagemService } from './mensagem/mensagem.service';
import { MensagemController } from './mensagem/mensagem.controller';

@Module({
  providers: [MensagemService],
  controllers: [MensagemController]
})
export class WhatsappModule {}
