import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTokenGuard } from 'src/auth/guards/api-token.guard';
import { IsPublic } from 'src/decorators/public/public.decorator';
import { CreateRegistroVisitaDto } from './dtos/create-registro-visita.dto';
import { PadreRamonService } from './padre-ramon.service';

@IsPublic()
@UseGuards(ApiTokenGuard)
@Controller('padre-ramon')
export class PadreRamonController {
  constructor(private readonly padreRamonService: PadreRamonService) { }

  @Post('registro-visita')
  async createRegistroVisita(@Body() createRegistroVisitaDto: CreateRegistroVisitaDto) {
    return this.padreRamonService.createRegistroVisita(createRegistroVisitaDto);
  }

}
