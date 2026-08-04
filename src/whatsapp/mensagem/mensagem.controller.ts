import { Body, Controller, Post } from '@nestjs/common';
import { ReceberMensagemDto } from '../dto/receber-mensagem.dto';
import { IsPublic } from 'src/decorators/public/public.decorator';
import { MensagemService } from './mensagem.service';

@Controller('whatsapp/mensagem')
export class MensagemController {
  constructor(private readonly mensagemService: MensagemService) { }

  @IsPublic()
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

  @Post('enviar')
  async enviarMensagem(@Body('text') text: string) {
    try {
      // return await this.mensagemService.enviarMensagem(text);
      return { success: true, message: 'Envio de mensagem esta desativado' };
    } catch (error) {
      console.error('Erro ao enviar mensagem whatsapp:', error);
      throw error;
    }
  }
}
