import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsSqsService } from './aws-sqs.service';

@Module({
  imports: [ConfigModule],
  providers: [AwsSqsService],
  exports: [AwsSqsService],
})
export class AwsModule {}
