import {
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PortaoService } from './portao.service';
import { RequestWithUser } from 'src/commons/IRequestWithUserClerk';
import { ClerkAuthGuard } from 'src/auth/clerk/clerk.guard';

@Controller('portao')
@UseGuards(ClerkAuthGuard)
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
