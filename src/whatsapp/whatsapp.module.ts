import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AwsModule } from 'src/aws/aws.module';
import { MensagemService } from './mensagem/mensagem.service';
import { MensagemController } from './mensagem/mensagem.controller';

@Module({
  imports: [AwsModule, HttpModule],
  providers: [MensagemService],
  controllers: [MensagemController],
})
export class WhatsappModule {}
