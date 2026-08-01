import { Body, Controller, Post } from '@nestjs/common';
import { ReceberMensagemDto } from '../dto/receber-mensagem.dto';
import { IsPublic } from 'src/decorators/public/public.decorator';
import { MensagemService } from './mensagem.service';

@IsPublic()
@Controller('whatsapp/mensagem')
export class MensagemController {
  constructor(private readonly mensagemService: MensagemService) { }

  @Post('receber')
  receberMensagem(@Body() body: unknown) {
    try {
      console.log('Recebendo mensagem whatsapp:', body);
      const mensagem = body as ReceberMensagemDto;
      return this.mensagemService.receberMensagem(mensagem);
    } catch (error) {
      console.error('Erro ao receber mensagem whatsapp:', error);
      throw error;
    }
  }
}
