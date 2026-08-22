import type { Message } from '@aws-sdk/client-sqs';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { SqsService } from 'src/aws/sqs/sqs.service';
import { MensagemService } from 'src/whatsapp/mensagem/mensagem.service';
import { ReceberMensagemDto } from 'src/whatsapp/dto/receber-mensagem.dto';
import { AfiliadosService } from 'src/afiliados/afiliados.service';
import { EnvService } from 'src/config/env.service';
import { MinioService } from 'src/minio/minio.service';
import { AVISEI_PRECO_BOM_STATUS_ONLINE } from 'src/utils/constants';

@Injectable()
export class WhatsAppWorkerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(WhatsAppWorkerService.name);
  private readonly intervalMs = 5000;
  private intervalId: NodeJS.Timeout | undefined;
  private afiliadosIdIntervalId: NodeJS.Timeout | undefined;

  constructor(
    private readonly env: EnvService,
    private readonly sqsService: SqsService,
    private readonly mensagemService: MensagemService,
    private readonly afiliadosService: AfiliadosService,
    private readonly minioService: MinioService,
  ) { }

  onApplicationBootstrap() {
    const sqsBaseUrl = this.env.AWS_SQS_BASE_URL;
    const sqsQueueName = this.env.AVISEI_PRECO_BOM_MENSAGENS_SQS_QUEUE_NAME;

    const queueUrl = `${sqsBaseUrl}/${sqsQueueName}`;
    if (!sqsBaseUrl || !sqsQueueName) {
      this.logger.warn('AWS_SQS_BASE_URL ou AVISEI_PRECO_BOM_MENSAGENS_SQS_QUEUE_NAME não configurada. Worker não iniciado.');
    } else {
      this.logger.log('WhatsApp SQS worker iniciado. Escutando fila de mensagens...');
      this.intervalId = setInterval(() => {
        this.processQueue(queueUrl).catch((error) => {
          this.logger.error('Erro não tratado no polling da fila SQS', error);
        });
      }, this.intervalMs);
    }

    this.startAfiliadosIdWorker(sqsBaseUrl);
  }

  private startAfiliadosIdWorker(sqsBaseUrl: string | undefined): void {
    const afiliadosIdQueueName = this.env.AVISEI_PRECO_BOM_AFILIADOS_ID_SQS_QUEUE_NAME;

    if (!sqsBaseUrl || !afiliadosIdQueueName) {
      this.logger.warn('AWS_SQS_BASE_URL ou AVISEI_PRECO_BOM_AFILIADOS_ID_SQS_QUEUE_NAME não configurada. Worker de afiliados não iniciado.');
      return;
    }

    const afiliadosIdQueueUrl = `${sqsBaseUrl}/${afiliadosIdQueueName}`;
    this.logger.log('WhatsApp SQS worker iniciado. Escutando fila de IDs de afiliados...');
    this.afiliadosIdIntervalId = setInterval(() => {
      this.processAfiliadosIdQueue(afiliadosIdQueueUrl).catch((error) => {
        this.logger.error('Erro não tratado no polling da fila SQS de afiliados', error);
      });
    }, this.intervalMs);
  }

  private async processAfiliadosIdQueue(queueUrl: string): Promise<void> {
    let message: Message | undefined;

    try {
      message = await this.sqsService.receiveMessage(queueUrl, {
        waitTimeSeconds: 20,
      });
    } catch (error) {
      this.logger.error('Erro ao ler mensagem da fila SQS de afiliados', error);
      return;
    }

    if (!message?.Body) {
      return;
    }

    let payload: { id: number };
    try {
      payload = JSON.parse(message.Body) as { id: number };
    } catch (error) {
      this.logger.error('Payload da fila SQS de afiliados inválido', error);
      return;
    }

    if (!payload.id) {
      this.logger.warn('Mensagem da fila de afiliados sem ID. Deletando mensagem inválida.');
      try {
        if (message.ReceiptHandle) {
          await this.sqsService.deleteMessage(queueUrl, message.ReceiptHandle);
        }
      } catch (error) {
        this.logger.error('Falha ao deletar mensagem inválida da fila SQS de afiliados', error);
      }
      return;
    }

    let mensagemExterna;
    try {
      mensagemExterna = await this.afiliadosService.buscarMensagemExternaById(String(payload.id));
    } catch (error) {
      this.logger.error(`Falha ao buscar mensagem externa pelo ID ${payload.id}`, error);
      return;
    }

    if (!mensagemExterna) {
      this.logger.warn(`Mensagem externa com ID ${payload.id} não encontrada. Deletando mensagem da fila.`);
      try {
        if (message.ReceiptHandle) {
          await this.sqsService.deleteMessage(queueUrl, message.ReceiptHandle);
        }
      } catch (error) {
        this.logger.error('Falha ao deletar mensagem da fila SQS de afiliados (mensagem não encontrada)', error);
      }
      return;
    }

    try {
      let imageBase64: string | undefined;
      if (mensagemExterna.imageUrl) {
        try {
          imageBase64 = await this.minioService.recuperarImagem(mensagemExterna.imageName);
        } catch (error) {
          this.logger.error(
            `Falha ao recuperar imagem do MinIO para mensagem ${payload.id} (imageUrl=${mensagemExterna.imageUrl}). Mantendo na fila SQS.`,
            error,
          );
          return;
        }
      }

      // TODO: alterar a imagem com logo da marca Avisei Preço Bom!

      await this.mensagemService.enviarMensagem(mensagemExterna.message, imageBase64);
      this.logger.debug(`Mensagem ${payload.id} enviada para WhatsApp com sucesso.`);

      await this.afiliadosService.atualizarMensagemExternaById(payload.id, { status: AVISEI_PRECO_BOM_STATUS_ONLINE });
    } catch (error) {
      this.logger.error(`Falha ao enviar mensagem ${payload.id} para WhatsApp. Mantendo na fila SQS.`, error);
      return;
    }

    try {
      if (message.ReceiptHandle) {
        await this.sqsService.deleteMessage(queueUrl, message.ReceiptHandle);
      }
    } catch (error) {
      this.logger.error('Falha ao deletar mensagem da fila SQS de afiliados após envio bem-sucedido', error);
    }
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
