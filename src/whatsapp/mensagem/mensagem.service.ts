import { Injectable } from '@nestjs/common';
import { ReceberMensagemDto } from '../dto/receber-mensagem.dto';
import { BaseService } from 'src/commons/BaseService';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MensagemService extends BaseService {
  constructor(protected readonly prismaService: PrismaService) {
    super(prismaService);
  }

  receberMensagem(mensagem: ReceberMensagemDto) {
    // Lógica para processar a mensagem recebida
    this.logger.debug(`Mensagem recebida: ${JSON.stringify(mensagem)}`);
    return { success: true };
  }
}
