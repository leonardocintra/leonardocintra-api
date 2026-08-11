import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AfiliadosService } from 'src/afiliados/afiliados.service';

@Injectable()
export class CronWorkerService {
  private readonly logger = new Logger(CronWorkerService.name);

  private static readonly CRON_EXPRESSION = '0 0 0 * * *';

  constructor(private readonly afiliadosService: AfiliadosService) { }

  @Cron(CronWorkerService.CRON_EXPRESSION, {
    name: 'delete-mensagens-antigas',
    timeZone: 'America/Sao_Paulo',
  })
  async deleteMensagensAntigas(): Promise<void> {
    this.logger.log('Iniciando cron: deletando mensagens antigas...');
    try {
      await this.afiliadosService.deleteMensagensAntigas();
      this.logger.log('Cron concluído: mensagens antigas deletadas com sucesso.');
    } catch (error) {
      this.logger.error('Erro ao executar cron de deleção de mensagens antigas', error);
    }
  }
}
