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
    const instanceId = this.configService.get<string>('EVOLUTION_INSTANCE_LEONARDO_ID');
    const allowedGroups = this.configService.get<string>('EVOLUTION_ALLOWED_GROUPS');
    const queueUrl = this.configService.get<string>('ACHE_PRECO_BOM_SQS_QUEUE_URL');

    if (mensagem.instance !== instanceId) {
      return { success: true };
    }

    // Verifica se a mensagem veio de um grupo permitido
    const allowedGroupsArray = allowedGroups?.split(',') ?? [];
    if (!allowedGroupsArray.includes(mensagem.data.key.remoteJid)) {
      return { success: true };
    }

    if (!queueUrl) {
      this.logger.warn(
        'ACHE_PRECO_BOM_SQS_QUEUE_URL não configurada. Mensagem não enviada para SQS.',
      );
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

  async enviarMensagem(text: string) {
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

    const url = `${apiUrl}/message/sendText/${instance}`;
    const headers = { apikey: apiKey };
    const body = { number: number, text, name: 'Juliana - Achei Preço Bom!' };

    try {
      const response = await firstValueFrom(this.httpService.post(url, body, { headers }));
      this.logger.debug(`Mensagem enviada para WhatsApp: ${number}`);
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
