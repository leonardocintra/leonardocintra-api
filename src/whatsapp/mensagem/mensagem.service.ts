import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SqsService } from 'src/aws/sqs/sqs.service';
import { ReceberMensagemDto } from '../dto/receber-mensagem.dto';
import { BaseService } from 'src/commons/BaseService';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MensagemService extends BaseService {
  constructor(
    protected readonly prismaService: PrismaService,
    private readonly sqsService: SqsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super(prismaService);
  }

  async receberMensagem(mensagem: ReceberMensagemDto) {
    const aviseiPrecoBomEnabled = this.configService.get<boolean>('AVISEI_PRECO_BOM_ENABLED', false);
    if (!aviseiPrecoBomEnabled) {
      this.logger.debug('Recebimento de mensagem desativado');
      return { success: true, message: 'Recebimento de mensagem desativado' };
    }

    const sqsBaseUrl = this.configService.get<string>('AWS_SQS_BASE_URL');
    const instanceId = this.configService.get<string>('EVOLUTION_INSTANCE_LEONARDO_ID');
    const allowedGroups = this.configService.get<string>('EVOLUTION_ALLOWED_GROUPS');
    const queueName = this.configService.get<string>('AVISEI_PRECO_BOM_MENSAGENS_SQS_QUEUE_NAME');

    const queueUrl = sqsBaseUrl && queueName ? `${sqsBaseUrl}/${queueName}` : 'ERRO';

    if (queueUrl === 'ERRO') {
      this.logger.error('AWS_SQS_BASE_URL ou AVISEI_PRECO_BOM_MENSAGENS_SQS_QUEUE_NAME não configurada');
      return { success: false, message: 'AWS_SQS_BASE_URL ou AVISEI_PRECO_BOM_MENSAGENS_SQS_QUEUE_NAME não configurada' };
    }


    if (mensagem.instance !== instanceId) {
      return { success: true };
    }

    // Verifica se a mensagem veio de um grupo permitido
    const allowedGroupsArray = allowedGroups?.split(',') ?? [];
    if (!allowedGroupsArray.includes(mensagem.data.key.remoteJid)) {
      return { success: true };
    }

    if (mensagem.data.message.conversation && this.filtrarMensagem(mensagem.data.message.conversation)) {
      this.logger.debug('Mensagem filtrada e não enviada para WhatsApp');
      return { success: true, message: 'Mensagem filtrada e não enviada para WhatsApp' };
    }

    try {
      await this.sqsService.sendMessage(queueUrl, JSON.stringify(mensagem));
    } catch (error) {
      this.logger.error('Falha ao enviar mensagem para SQS', error);
    }

    return { success: true };
  }

  async enviarMensagem(text: string, imageBase64?: string): Promise<any> {
    const apiUrl = this.configService.get<string>('EVOLUTION_API_URL');
    const apiKey = this.configService.get<string>('EVOLUTION_API_KEY');
    const instance = this.configService.get<string>('EVOLUTION_INSTANCE_JULIANA_ID');
    const number = this.configService.get<string>('EVOLUTION_WHATSAPP_NUMBER');

    if (!apiUrl) {
      throw new Error('EVOLUTION_API_URL não configurada');
    }
    if (!apiKey) {
      throw new Error('EVOLUTION_API_KEY não configurada');
    }
    if (!instance) {
      throw new Error('EVOLUTION_INSTANCE_JULIANA_ID não configurada');
    }

    const url = `${apiUrl}/message/sendMedia/${instance}`;
    const headers = { apikey: apiKey };
    const body = {
      number,
      mediatype: 'image',
      mimetype: 'image/jpeg',
      media: imageBase64,
      caption: text,
      fileName: 'imagem.jpg',
    };

    this.logger.debug(body);

    try {
      const response = await firstValueFrom(this.httpService.post(url, body, { headers }));
      return response.data;
    } catch (error) {
      this.logger.error(
        `Falha ao enviar mensagem para WhatsApp (${number})`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private filtrarMensagem(mensagem: string): boolean {
    return mensagem.includes('Achado Amazon') || mensagem.includes('Achado Netshoes') || mensagem.includes('Achado Kabum') || mensagem.includes('Achado Submarino') || mensagem.includes('Achado Americanas') || mensagem.includes('Achado Magazine Luiza') || mensagem.includes('Achado Magazine Luiza');
  }
}
