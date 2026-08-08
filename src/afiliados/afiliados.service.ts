import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/commons/BaseService';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateMensagemExternaDto } from './dto/update-mensagem.dto';

@Injectable()
export class AfiliadosService extends BaseService {

  constructor(protected readonly prismaService: PrismaService) {
    super(prismaService);
  }

  async atualizarMensagemExternaById(id: number, updateMensagemExternaDto: UpdateMensagemExternaDto) {
    const updateData = updateMensagemExternaDto;
    return await this.prismaService.afiliadosMensagemExterna.update({
      where: { id: +id },
      data: updateData,
    });
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
}