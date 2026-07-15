import { HttpService } from '@nestjs/axios';
import type { Message } from '@aws-sdk/client-sqs';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronTime } from 'cron';
import { firstValueFrom } from 'rxjs';
import { AwsSqsService } from 'src/aws/aws-sqs.service';
import { CreateRegistroVisitaDto } from 'src/padre-ramon/dtos/create-registro-visita.dto';

@Injectable()
export class SqsConsumerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SqsConsumerService.name);
  private static readonly CRON_JOB_NAME = 'padre-ramon-sqs-consumer';
  private static readonly DEFAULT_CRON_EXPRESSION = '0 0 8-18/2 * * *';
  private readonly webhookUrl = process.env.LEONARDO_N8N_WEBHOOK_URL as string;

  constructor(
    private readonly configService: ConfigService,
    private readonly awsSqsService: AwsSqsService,
    private readonly httpService: HttpService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) { }

  async onApplicationBootstrap() {
    const cronExpression =
      this.configService.get<string>('PADRE_RAMON_SQS_CRON') ?? SqsConsumerService.DEFAULT_CRON_EXPRESSION;

    try {
      const job = this.schedulerRegistry.getCronJob(SqsConsumerService.CRON_JOB_NAME);
      job.setTime(new CronTime(cronExpression));
      job.start();
      const nextExecutionDate = job.nextDate();
      const nextExecution = nextExecutionDate.toISO() ?? nextExecutionDate.toString();
      this.logger.log(
        `Cron ${SqsConsumerService.CRON_JOB_NAME} agendado para ${cronExpression}. Proxima execucao: ${nextExecution}`,
      );
    } catch (error) {
      this.logger.error('Não foi possível registrar o cron de consumo da fila SQS', error);
    }
  }

  @Cron(SqsConsumerService.DEFAULT_CRON_EXPRESSION, { name: SqsConsumerService.CRON_JOB_NAME })
  async handleCron() {
    await this.processSqsQueue();
  }

  private async processSqsQueue() {
    const queueUrl = this.configService.get<string>('PADRE_RAMON_SQS_QUEUE_URL');

    if (!queueUrl) {
      this.logger.warn('PADRE_RAMON_SQS_QUEUE_URL não configurada. Pulando verificação da fila.');
      return;
    }

    let hasMessages = true;

    while (hasMessages) {
      let message: Message | undefined;

      try {
        message = await this.awsSqsService.receiveMessage(queueUrl);
      } catch (error) {
        this.logger.error('Erro ao ler mensagem da fila SQS Padre Ramon', error);
        break;
      }

      if (!message?.Body) {
        this.logger.debug('Nenhuma (nova) mensagem na fila SQS Padre Ramon no momento.');
        hasMessages = false;
        break;
      }

      let payload: CreateRegistroVisitaDto;
      try {
        payload = JSON.parse(message.Body) as CreateRegistroVisitaDto;
      } catch (error) {
        this.logger.error('Payload da fila SQS inválido', error);
        continue;
      }

      const webhookPayload = {
        ...payload,
        type: 'registro-visita' as const,
      };

      try {
        await firstValueFrom(this.httpService.post(this.webhookUrl, webhookPayload));
      } catch (error) {
        this.logger.error('Falha ao notificar webhook do registro de visita', error);
        continue;
      }

      try {
        if (message.ReceiptHandle) {
          await this.awsSqsService.deleteMessage(queueUrl, message.ReceiptHandle);
        }
      } catch (error) {
        this.logger.error('Falha ao deletar mensagem da fila SQS após envio do webhook', error);
      }

      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
}
