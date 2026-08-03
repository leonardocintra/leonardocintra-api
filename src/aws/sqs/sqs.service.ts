import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteMessageCommand,
  Message,
  PurgeQueueCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  type SendMessageCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {
  DEFAULT_AWS_REGION,
  DEFAULT_MAX_NUMBER_OF_MESSAGES,
  DEFAULT_MESSAGE_ATTRIBUTE_NAMES,
  DEFAULT_WAIT_TIME_SECONDS,
} from './constants/sqs.constants';
import type { SqsReceiveOptions } from './interfaces/sqs-receive-options.interface';
import type { SqsSendOptions } from './interfaces/sqs-send-options.interface';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private readonly client: SQSClient;

  constructor(private readonly configService: ConfigService) {
    this.client = new SQSClient({
      region: this.configService.get<string>('AWS_REGION', DEFAULT_AWS_REGION),
    });
  }

  async receiveMessage(
    queueUrl: string,
    options?: SqsReceiveOptions,
  ): Promise<Message | undefined> {
    if (!queueUrl) {
      throw new Error('AWS SQS queue URL is not configured');
    }

    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: options?.maxNumberOfMessages ?? DEFAULT_MAX_NUMBER_OF_MESSAGES,
        WaitTimeSeconds: options?.waitTimeSeconds ?? DEFAULT_WAIT_TIME_SECONDS,
        MessageAttributeNames: options?.messageAttributeNames ?? DEFAULT_MESSAGE_ATTRIBUTE_NAMES,
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

  async sendMessage(
    queueUrl: string,
    messageBody: string,
    options?: SqsSendOptions,
  ): Promise<SendMessageCommandOutput> {
    if (!queueUrl || !messageBody) {
      throw new Error('AWS SQS queue URL and message body are required');
    }

    try {
      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: messageBody,
        DelaySeconds: options?.delaySeconds,
        MessageAttributes: options?.messageAttributes,
      });

      return await this.client.send(command);
    } catch (error) {
      this.logger.error('Falha ao enviar mensagem para a fila SQS', error);
      throw error;
    }
  }

  async purgeQueue(queueUrl: string): Promise<void> {
    if (!queueUrl) {
      throw new Error('AWS SQS queue URL is not configured');
    }

    try {
      const command = new PurgeQueueCommand({
        QueueUrl: queueUrl,
      });

      await this.client.send(command);
    } catch (error) {
      this.logger.error('Falha ao limpar a fila SQS', error);
      throw error;
    }
  }
}
