import { Injectable } from '@nestjs/common';

@Injectable()
export class AfiliadosService {
  converterMensagem(mensagem: string): string {
    return mensagem;
  }
}
