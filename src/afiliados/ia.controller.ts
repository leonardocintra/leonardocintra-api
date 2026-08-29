import { Body, Controller, Post } from '@nestjs/common';
import { IsPublic } from 'src/decorators/public/public.decorator';
import { MelhorarMensagemDto } from './dto/melhorar-mensagem.dto';
import { IaService } from './ia.service';

@Controller('afiliados/ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @IsPublic()
  @Post('/melhorar-mensagem')
  async melhorarMensagem(@Body() dto: MelhorarMensagemDto) {
    return this.iaService.melhorarMensagem(dto);
  }
}
