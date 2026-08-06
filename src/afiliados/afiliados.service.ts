import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/commons/BaseService';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AfiliadosService extends BaseService {

  constructor(protected readonly prismaService: PrismaService) {
    super(prismaService);
  }

  converterMensagem(mensagem: string): string {
    this.logger.debug(`Mensagem original: ${mensagem}`);
    const mensagemConvertida = mensagem.replaceAll('https://pechin.co/whatsapp', 'https://www.aviseiprecobom.com.br/');
    return mensagemConvertida;
  }
}