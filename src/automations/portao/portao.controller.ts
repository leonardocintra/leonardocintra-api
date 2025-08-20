import { Controller, Get, Post } from '@nestjs/common';
import { PortaoService } from './portao.service';

@Controller('portao')
export class PortaoController {
  constructor(private readonly portaoService: PortaoService) {}

  @Post('abrir')
  abrirPortao() {
    return this.portaoService.abrirPortao();
  }

  @Post('fechar')
  fecharPortao() {
    return this.portaoService.fecharPortao();
  }

  @Get('status')
  getStatus() {
    return this.portaoService.getUltimoAcionamento();
  }
}
