import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AwsModule } from 'src/aws/aws.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { WhatsAppWorkerService } from './whatsapp-worker.service';
import { CronWorkerService } from './cron-worker.service';
import { AfiliadosModule } from 'src/afiliados/afiliados.module';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [AwsModule, WhatsappModule, AfiliadosModule, MinioModule, ScheduleModule],
  providers: [WhatsAppWorkerService, CronWorkerService],
})
export class WorkerModule { }
