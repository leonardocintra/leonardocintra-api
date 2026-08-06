import { Injectable } from '@nestjs/common';

@Injectable()
export class AfiliadosService {
  converterMensagem(mensagem: string): string {
    const mensagemConvertida = mensagem.replace('https://pechin.co/whatsapp', 'https://www.aviseiprecobom.com.br/');
    return mensagemConvertida;
  }
}
