import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseService } from 'src/commons/BaseService';
import { PrismaService } from 'src/prisma/prisma.service';
import { SqsService } from 'src/aws/sqs/sqs.service';
import { UpdateMensagemExternaDto } from './dto/update-mensagem.dto';

@Injectable()
export class AfiliadosService extends BaseService {

  constructor(
    protected readonly prismaService: PrismaService,
    private readonly sqsService: SqsService,
    private readonly configService: ConfigService,
  ) {
    super(prismaService);
  }

  async atualizarMensagemExternaById(id: number, updateMensagemExternaDto: UpdateMensagemExternaDto) {
    const updateData = updateMensagemExternaDto;
    const mensagemAtualizada = await this.prismaService.afiliadosMensagemExterna.update({
      where: { id: +id },
      data: updateData,
    });

    const sqsBaseUrl = this.configService.get<string>('AWS_SQS_BASE_URL');
    const queueName = this.configService.get<string>('AVISEI_PRECO_BOM_AFILIADOS_ID_SQS_QUEUE_NAME');

    if (sqsBaseUrl && queueName) {
      const url = `${sqsBaseUrl}/${queueName}`;
      try {
        await this.sqsService.sendMessage(url, JSON.stringify({ id: mensagemAtualizada.id }));
        this.logger.debug(`Mensagem ${mensagemAtualizada.id} enviada para a fila SQS afiliados-id-mensagem`);
      } catch (error) {
        this.logger.error(`Falha ao enviar mensagem ${mensagemAtualizada.id} para a fila SQS afiliados-id-mensagem`, error);
      }
    } else {
      this.logger.warn('AWS_SQS_BASE_URL ou AVISEI_PRECO_BOM_AFILIADOS_ID_SQS_QUEUE_NAME não configurada. Mensagem não enviada para SQS.');
    }

    return mensagemAtualizada;
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
    return await this.prismaService.afiliadosMensagemExterna.create({
      data: {
        origem,
        message,
      },
    }).then(() => {
      this.logger.debug(`Mensagem externa salva com sucesso. Origem: ${origem}`);
    }).catch((error) => {
      this.logger.error(`Erro ao salvar mensagem externa. Origem: ${origem}`, error);
    });
  }

  async deleteMensagemExternaById(id: number): Promise<void> {
    return await this.prismaService.afiliadosMensagemExterna.delete({
      where: { id: +id },
    }).then(() => {
      this.logger.debug(`Mensagem externa deletada com sucesso. ID: ${id}`);
    }).catch((error) => {
      this.logger.error(`Erro ao deletar mensagem externa. ID: ${id}`, error);
    });
  }

  async deleteMensagensAntigas(): Promise<void> {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 1); // 1 dia atrás

    return await this.prismaService.afiliadosMensagemExterna.deleteMany({
      where: {
        createdAt: {
          lt: dataLimite,
        },
      },
    }).then((result) => {
      this.logger.debug(`Mensagens externas antigas deletadas com sucesso. Total deletado: ${result.count}`);
    }).catch((error) => {
      this.logger.error('Erro ao deletar mensagens externas antigas', error);
    });
  }
}