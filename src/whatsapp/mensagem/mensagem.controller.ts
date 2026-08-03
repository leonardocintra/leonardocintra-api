import { Body, Controller, Post } from '@nestjs/common';
import { ReceberMensagemDto } from '../dto/receber-mensagem.dto';
import { IsPublic } from 'src/decorators/public/public.decorator';
import { MensagemService } from './mensagem.service';

@IsPublic()
@Controller('whatsapp/mensagem')
export class MensagemController {
  constructor(private readonly mensagemService: MensagemService) { }

  @Post('receber')
  async receberMensagem(@Body() body: unknown) {
    try {
      const mensagem = body as ReceberMensagemDto;
      return await this.mensagemService.receberMensagem(mensagem);
    } catch (error) {
      console.error('Erro ao receber mensagem whatsapp:', error);
      throw error;
    }
  }
}
