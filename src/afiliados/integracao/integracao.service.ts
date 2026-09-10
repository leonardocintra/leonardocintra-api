import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/commons/BaseService';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IntegracaoService extends BaseService {
  constructor(
    protected readonly prismaService: PrismaService,
  ) {
    super(prismaService);
  }

  async salvarCodigoApiCliente(codigo: string, name: string) {
    return await this.prismaService.apiClient.create({
      data: {
        name: name,
        tokenHash: codigo,
      }
    })
  }
}
