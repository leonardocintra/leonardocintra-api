import { Controller, Get, Query } from '@nestjs/common';
import { IsPublic } from 'src/decorators/public/public.decorator';
import { IntegracaoService } from './integracao.service';

@IsPublic()
@Controller('integration')
export class IntegracaoController {

  constructor(private readonly integracaoService: IntegracaoService) { }

  @Get('mercadolivre/callback')
  async mercadolivreCallback(@Query('code') code?: string) {
    if (!code) {
      return { message: `Callback do Mercado Livre recebido sem o parâmetro 'code'.` };
    }
    await this.integracaoService.salvarCodigoApiCliente(code, 'Mercado Livre - Afiliados');
    return { message: `Callback do Mercado Livre recebido com sucesso! Code: ${code}` };
  }

  @Get('mercadolivre/notifications')
  async mercadolivreNotifications() {
    return { message: `Notificação do Mercado Livre recebido com sucesso!` };
  }
}
