import { Controller, Get, Query } from '@nestjs/common';
import { IsPublic } from 'src/decorators/public/public.decorator';

@IsPublic()
@Controller('integration')
export class IntegracaoController {

  @Get('mercadolivre/callback')
  async mercadolivreCallback(@Query('code') code?: string) {
    // Lógica para lidar com o callback do Mercado Livre
    return { message: `Callback do Mercado Livre recebido com sucesso! Code: ${code}` };
  }

  @Get('mercadolivre/notifications')
  async mercadolivreNotifications() {
    return { message: `Notificação do Mercado Livre recebido com sucesso!` };
  }
}
