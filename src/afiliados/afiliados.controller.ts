import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { AfiliadosService } from './afiliados.service';
import { IsPublic } from 'src/decorators/public/public.decorator';
import { UpdateMensagemExternaDto } from './dto/update-mensagem.dto';

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

  @IsPublic()
  @Patch('/mensagem-externa/:id')
  async updateMensagemExterna(@Param('id') id: number, @Body() updateMensagemExternaDto: UpdateMensagemExternaDto) {
    return this.afiliadosService.atualizarMensagemExternaById(id, updateMensagemExternaDto);
  }

  @IsPublic()
  @Delete('/mensagem-externa/:id')
  async deleteMensagemExterna(@Param('id') id: number) {
    return this.afiliadosService.deleteMensagemExternaById(id);
  }
}
