import { Controller, Get, Query } from '@nestjs/common';

@Controller('integracao')
export class IntegracaoController {

  @Get('mercadolivre/callback')
  async mercadolivreCallback(@Query('code') code?: string) {
    // Lógica para lidar com o callback do Mercado Livre
    // parametro code= gerar log

    return { message: `Callback do Mercado Livre recebido com sucesso! Code: ${code}` };
  }
}
