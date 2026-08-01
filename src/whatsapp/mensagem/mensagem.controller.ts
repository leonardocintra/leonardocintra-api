import { Body, Controller, Post } from '@nestjs/common';
import { ReceberMensagemDto } from '../dto/receber-mensagem.dto';
import { IsPublic } from 'src/decorators/public/public.decorator';
import { MensagemService } from './mensagem.service';

@IsPublic()
@Controller('whatsapp/mensagem')
export class MensagemController {
  constructor(private readonly mensagemService: MensagemService) { }

  @Post('receber')
  async receberMensagem(@Body() mensagem: ReceberMensagemDto) {
    return this.mensagemService.receberMensagem(mensagem);
  }
}
