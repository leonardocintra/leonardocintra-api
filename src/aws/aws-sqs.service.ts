import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

@Injectable()
export class AwsSqsService {
  private readonly logger = new Logger(AwsSqsService.name);
  private readonly client: SQSClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new SQSClient({
      region: this.configService.get<string>('AWS_REGION', 'sa-east-1'),
    });
  }

  async receiveMessage(queueUrl: string): Promise<Message | undefined> {
    if (!queueUrl) {
      throw new Error('AWS SQS queue URL is not configured');
    }

    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 0,
        MessageAttributeNames: ['All'],
      });

      const response = await this.client.send(command);
      return response.Messages?.[0];
    } catch (error) {
      this.logger.error('Falha ao receber mensagem da fila SQS', error);
      throw error;
    }
  }

  async deleteMessage(queueUrl: string, receiptHandle?: string): Promise<void> {
    if (!queueUrl || !receiptHandle) {
      return;
    }

    try {
      const command = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.client.send(command);
    } catch (error) {
      this.logger.error('Falha ao deletar mensagem da fila SQS', error);
      throw error;
    }
  }
}
