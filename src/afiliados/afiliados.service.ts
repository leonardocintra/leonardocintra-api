import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/commons/BaseService';
import { PrismaService } from 'src/prisma/prisma.service';
import { SqsService } from 'src/aws/sqs/sqs.service';
import { UpdateMensagemExternaDto } from './dto/update-mensagem.dto';
import { AVISEI_PRECO_BOM_STATUS_PENDING } from 'src/utils/constants';
import { EnvService } from 'src/config/env.service';

@Injectable()
export class AfiliadosService extends BaseService {

  constructor(
    protected readonly prismaService: PrismaService,
    private readonly sqsService: SqsService,
    private readonly env: EnvService,
  ) {
    super(prismaService);
  }

  async atualizarMensagemExternaById(id: number, updateMensagemExternaDto: UpdateMensagemExternaDto) {
    const updateData = updateMensagemExternaDto;
    const mensagemAtualizada = await this.prismaService.afiliadosMensagemExterna.update({
      where: { id: +id },
      data: updateData,
    });

    if (mensagemAtualizada.status === AVISEI_PRECO_BOM_STATUS_PENDING) {
      await this.enviarParaFilaSQS(mensagemAtualizada.id);
    }
    return mensagemAtualizada;
  }

  private async enviarParaFilaSQS(mensagemId: number): Promise<void> {
    const sqsBaseUrl = this.env.AWS_SQS_BASE_URL;
    const queueName = this.env.AVISEI_PRECO_BOM_AFILIADOS_ID_SQS_QUEUE_NAME;

    if (sqsBaseUrl && queueName) {
      const url = `${sqsBaseUrl}/${queueName}`;
      try {
        await this.sqsService.sendMessage(url, JSON.stringify({ id: mensagemId }));
      } catch (error) {
        this.logger.error(`Falha ao enviar mensagem ${mensagemId} para a fila SQS afiliados-id-mensagem`, error);
      }
    } else {
      this.logger.warn('AWS_SQS_BASE_URL ou AVISEI_PRECO_BOM_AFILIADOS_ID_SQS_QUEUE_NAME não configurada. Mensagem não enviada para SQS.');
    }
  }

  async buscarMensagemExternaById(id: string) {
    return await this.prismaService.afiliadosMensagemExterna.findUnique({
      where: { id: +id },
    });
  }

  async buscarMensagemExterna(origem?: string, status?: string) {
    const where = origem ? { origem } : {};
    if (status) {
      where['status'] = status;
    }
    return await this.prismaService.afiliadosMensagemExterna.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async salvarMensagemExterna(origem: string, message: string): Promise<void> {
    await this.prismaService.afiliadosMensagemExterna.create({
      data: {
        origem,
        message,
      },
    }).catch((error) => {
      this.logger.error(`Erro ao salvar mensagem externa. Origem: ${origem}`, error);
    });
  }

  async deleteMensagemExternaById(id: number): Promise<void> {
    await this.prismaService.afiliadosMensagemExterna.delete({
      where: { id: +id },
    }).catch((error) => {
      this.logger.error(`Erro ao deletar mensagem externa. ID: ${id}`, error);
    });
  }

  async deleteMensagensAntigas(): Promise<void> {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 1); // 1 dia atrás

    // TODO: apagar a imagem do Minio também, se existir.

    await this.prismaService.afiliadosMensagemExterna.deleteMany({
      where: {
        status: AVISEI_PRECO_BOM_STATUS_PENDING,
        createdAt: {
          lt: dataLimite,
        },
      },
    }).catch((error) => {
      this.logger.error('Erro ao deletar mensagens externas antigas', error);
    });
  }
}
