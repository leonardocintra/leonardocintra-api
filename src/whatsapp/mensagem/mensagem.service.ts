import { Injectable } from '@nestjs/common';
import { SqsService } from 'src/aws/sqs/sqs.service';
import { ReceberMensagemDto } from '../dto/receber-mensagem.dto';
import { BaseService } from 'src/commons/BaseService';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MensagemService extends BaseService {
  constructor(
    protected readonly prismaService: PrismaService,
    private readonly sqsService: SqsService,
  ) {
    super(prismaService);
  }

  async receberMensagem(mensagem: ReceberMensagemDto) {
    if (mensagem.instance !== process.env.EVOLUTION_INSTANCE_ID) {
      return { success: true };
    }

    if (mensagem.data.key.remoteJid !== process.env.EVOLUTION_ALLOWED_GROUPS) {
      return { success: true };
    }

    const queueUrl = process.env.ACHE_PRECO_BOM_SQS_QUEUE_URL;
    if (!queueUrl) {
      this.logger.warn('ACHE_PRECO_BOM_SQS_QUEUE_URL não configurada. Mensagem não enviada para SQS.');
      return { success: true };
    }

    try {
      await this.sqsService.sendMessage(queueUrl, JSON.stringify(mensagem));
      this.logger.debug(`Mensagem enviada para SQS: ${JSON.stringify(mensagem.instance)}`);
    } catch (error) {
      this.logger.error('Falha ao enviar mensagem para SQS', error);
    }

    return { success: true };
  }
}
