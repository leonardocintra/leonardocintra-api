import { Body, Controller, Post } from '@nestjs/common';
import { ReceberMensagemDto } from '../dto/receber-mensagem.dto';
import { IsPublic } from 'src/decorators/public/public.decorator';
import { MensagemService } from './mensagem.service';

@IsPublic()
@Controller('whatsapp/mensagem')
export class MensagemController {
  constructor(private readonly mensagemService: MensagemService) { }

  @Post('receber')
  receberMensagem(@Body() mensagem: any) {
    console.log('Mensagem recebida:', mensagem);
    return this.mensagemService.receberMensagem(mensagem);
  }
}
