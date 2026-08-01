import { Body, Controller, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { ReceberMensagemDto } from '../dto/receber-mensagem.dto';
import { IsPublic } from 'src/decorators/public/public.decorator';
import { MensagemService } from './mensagem.service';

@IsPublic()
@Controller('whatsapp/mensagem')
export class MensagemController {
  constructor(private readonly mensagemService: MensagemService) { }

  @Post('receber')
  async receberMensagem(@Body() payload: unknown) {
    const item = Array.isArray(payload) ? payload[0] : payload;
    const mensagem = plainToInstance(ReceberMensagemDto, item);
    await validateOrReject(mensagem);
    return this.mensagemService.receberMensagem(mensagem);
  }
}
