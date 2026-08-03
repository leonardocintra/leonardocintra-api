import { Module } from '@nestjs/common';
import { SqsModule } from './sqs/sqs.module';

@Module({
  imports: [SqsModule],
  exports: [SqsModule],
})
export class AwsModule {}
