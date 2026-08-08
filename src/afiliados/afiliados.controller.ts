import { Controller, Get, Param, Query } from '@nestjs/common';
import { AfiliadosService } from './afiliados.service';
import { IsPublic } from 'src/decorators/public/public.decorator';

@Controller('afiliados')
export class AfiliadosController {

  constructor(private readonly afiliadosService: AfiliadosService) { }

  @IsPublic()
  @Get('/mensagem-externa')
  async getAfiliados(@Query('origem') origem?: string, @Query('status') status?: string) {
    return this.afiliadosService.buscarMensagemExterna(origem, status);
  }

  @IsPublic()
  @Get('/mensagem-externa/:id')
  async getAfiliadosById(@Param('id') id: string) {
    return this.afiliadosService.buscarMensagemExternaById(id);
  }
}
