import { Module } from '@nestjs/common';
import { AwsModule } from 'src/aws/aws.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { WhatsAppWorkerService } from './whatsapp-worker.service';

@Module({
  imports: [AwsModule, WhatsappModule],
  providers: [WhatsAppWorkerService],
})
export class WorkerModule {}
