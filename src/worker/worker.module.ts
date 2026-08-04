import { Module } from '@nestjs/common';
import { AwsModule } from 'src/aws/aws.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { WhatsAppWorkerService } from './whatsapp-worker.service';
import { AfiliadosModule } from 'src/afiliados/afiliados.module';

@Module({
  imports: [AwsModule, WhatsappModule, AfiliadosModule],
  providers: [WhatsAppWorkerService],
})
export class WorkerModule { }
