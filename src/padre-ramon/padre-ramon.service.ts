import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRegistroVisitaDto } from './dtos/create-registro-visita.dto';

@Injectable()
export class PadreRamonService {
  private readonly logger = new Logger(PadreRamonService.name);

  constructor(private readonly prisma: PrismaService) { }

  async createRegistroVisita(createRegistroVisitaDto: CreateRegistroVisitaDto) {
    this.logger.log('Creating registro visita');
    // Logic to create a registro visita in the database
    return this.prisma.padreRamonRegistroVisitaTumulo.create({
      data: {
        name: createRegistroVisitaDto.nome,
        dataDaVisita: createRegistroVisitaDto.dataVisita,
        cidade: createRegistroVisitaDto.cidade,
        pais: createRegistroVisitaDto.pais,
        numeroDePessoas: createRegistroVisitaDto.numeroPessoas,
        message: createRegistroVisitaDto.mensagem,
        email: createRegistroVisitaDto.email,
        whatsapp: createRegistroVisitaDto.whatsapp,
      }
    })
  }
}
