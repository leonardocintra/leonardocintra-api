import { Controller, Get, InternalServerErrorException, Post, Req } from '@nestjs/common';
import type { RequestWithUser } from 'src/commons/IRequestWithUserClerk';
import type { PortaoService } from './portao.service';

@Controller('portao')
export class PortaoController {
  constructor(private readonly portaoService: PortaoService) {}

  @Post('abrir')
  abrirPortao(@Req() req: RequestWithUser) {
    if (!req.user) {
      throw new InternalServerErrorException(
        'User object not found on request. Auth guard might have failed.',
      );
    }

    const userId = req.user.sub;
    return this.portaoService.abrirPortao(userId);
  }

  @Post('fechar')
  fecharPortao(@Req() req: RequestWithUser) {
    if (!req.user) {
      throw new InternalServerErrorException(
        'User object not found on request. Auth guard might have failed.',
      );
    }

    const userId = req.user.sub;
    return this.portaoService.fecharPortao(userId);
  }

  @Get('status')
  getStatus(@Req() req: RequestWithUser) {
    if (!req.user) {
      throw new InternalServerErrorException(
        'User object not found on request. Auth guard might have failed.',
      );
    }

    return this.portaoService.getUltimoAcionamento();
  }
}
