import type { Message } from '@aws-sdk/client-sqs';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsService } from 'src/aws/sqs/sqs.service';
import { MensagemService } from 'src/whatsapp/mensagem/mensagem.service';
import { ReceberMensagemDto } from 'src/whatsapp/dto/receber-mensagem.dto';
import { AfiliadosService } from 'src/afiliados/afiliados.service';

@Injectable()
export class WhatsAppWorkerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(WhatsAppWorkerService.name);
  private readonly intervalMs = 5000;
  private intervalId: NodeJS.Timeout | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly sqsService: SqsService,
    private readonly mensagemService: MensagemService,
    private readonly afiliadosService: AfiliadosService,
  ) { }

  onApplicationBootstrap() {
    const sqsBaseUrl = this.configService.get<string>('AWS_SQS_BASE_URL');
    const sqsQueueName = this.configService.get<string>('AVISEI_PRECO_BOM_MENSAGENS_SQS_QUEUE_NAME');

    const queueUrl = `${sqsBaseUrl}/${sqsQueueName}`;
    if (!sqsBaseUrl || !sqsQueueName) {
      this.logger.warn('AWS_SQS_BASE_URL ou AVISEI_PRECO_BOM_MENSAGENS_SQS_QUEUE_NAME não configurada. Worker não iniciado.');
      return;
    }

    this.logger.log('WhatsApp SQS worker iniciado. Escutando fila...');
    this.intervalId = setInterval(() => {
      this.processQueue(queueUrl).catch((error) => {
        this.logger.error('Erro não tratado no polling da fila SQS', error);
      });
    }, this.intervalMs);
  }

  private async processQueue(queueUrl: string): Promise<void> {
    let message: Message | undefined;

    try {
      message = await this.sqsService.receiveMessage(queueUrl, {
        waitTimeSeconds: 20,
      });
    } catch (error) {
      this.logger.error('Erro ao ler mensagem da fila SQS', error);
      return;
    }

    if (!message?.Body) {
      return;
    }

    let payload: ReceberMensagemDto;
    try {
      payload = JSON.parse(message.Body) as ReceberMensagemDto;
    } catch (error) {
      this.logger.error('Payload da fila SQS inválido', error);
      return;
    }
    await this.processMessage(payload, message, queueUrl);
  }

  private async processMessage(payload: ReceberMensagemDto, message: Message, queueUrl: string): Promise<void> {
    const text = payload?.data?.message?.conversation;

    if (!text) {
      this.logger.warn(
        `Mensagem sem texto (conversation). messageType: ${payload?.data?.messageType ?? 'desconhecido'}`,
      );
      try {
        if (message.ReceiptHandle) {
          await this.sqsService.deleteMessage(queueUrl, message.ReceiptHandle);
        }
      } catch (error) {
        this.logger.error('Falha ao deletar mensagem inválida da fila SQS', error);
      }
      return;
    }

    try {
      await this.afiliadosService.salvarMensagemExterna('WhatsApp', text);
      this.logger.debug('Mensagem salva no banco com sucesso.');
    } catch (error) {
      this.logger.error('Falha ao salvar mensagem no banco', error);
      return;
    }

    try {
      if (message.ReceiptHandle) {
        await this.sqsService.deleteMessage(queueUrl, message.ReceiptHandle);
      }
    } catch (error) {
      this.logger.error('Falha ao deletar mensagem da fila SQS após envio bem-sucedido', error);
    }
  }
}
