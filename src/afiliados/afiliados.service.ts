import { Injectable } from '@nestjs/common';

@Injectable()
export class AfiliadosService {

  converterMensagem(mensagem: string): string {
    const mensagemConvertida = "Teste Leonardo - Ainda testando";
    return mensagemConvertida;
  }
}