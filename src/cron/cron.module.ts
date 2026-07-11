import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AwsModule } from 'src/aws/aws.module';
import { CronService } from './cron.service';
import { SqsConsumerService } from './sqs-consumer/sqs-consumer.service';

@Module({
  imports: [HttpModule, AwsModule, ScheduleModule],
  providers: [CronService, SqsConsumerService],
  exports: [CronService],
})
export class CronModule {}
