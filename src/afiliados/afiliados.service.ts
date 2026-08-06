import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/commons/BaseService';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AfiliadosService extends BaseService {

  constructor(protected readonly prismaService: PrismaService) {
    super(prismaService);
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
}