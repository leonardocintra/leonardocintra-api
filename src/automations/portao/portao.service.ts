import { createClerkClient, User } from '@clerk/backend';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { LeadsService } from 'src/leads/leads.service';
import { MqttService } from 'src/mqtt/mqtt.service';

@Injectable()
export class PortaoService {
  private readonly logger = new Logger(PortaoService.name);

  private clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  constructor(
    private readonly leadService: LeadsService,
    private readonly mqttService: MqttService,
  ) {}

  private enviarComandoPortao(
    comando: string,
    acao: string,
  ): { success: boolean; status: string } {
    try {
      this.mqttService.publish('casa/portao', comando);
      this.logger.log(`Comando enviado: ${acao} portão`);
      return {
        success: true,
        status: 'comando_enviado',
      };
    } catch (error) {
      this.logger.error(`Erro ao enviar comando para ${acao} portão:`, error);
      return {
        success: false,
        status: 'erro',
      };
    }
  }

  async abrirPortao(userId: string) {
    await this.isValidUser(userId);
    return this.enviarComandoPortao('abrir', 'abrir');
  }

  async fecharPortao(userId: string) {
    await this.isValidUser(userId);
    return this.enviarComandoPortao('fechar', 'fechar');
  }

  getUltimoAcionamento(): { status: string | null } {
    return { status: this.mqttService.getUltimoStatus() };
  }

  private async isValidUser(userId: string) {
    const user = await this.getUserClerk(userId);
    this.logger.log(
      `Usuário: ${user.firstName} ${user.lastName}, Email: ${user.emailAddresses[0]?.emailAddress}`,
    );
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      this.logger.warn('Usuário sem email');
      throw new ForbiddenException('Usuário sem email');
    }

    const lead = await this.leadService.findByEmail(email);
    if (!lead) {
      this.logger.warn(`Usuário ${email} não encontrado`);
      throw new ForbiddenException('Usuário não encontrado');
    }
  }

  private async getUserClerk(userId: string): Promise<User> {
    try {
      const user = await this.clerkClient.users.getUser(userId);
      return user;
    } catch (error) {
      console.error('Error fetching user from Clerk:', error);
      throw new Error('Unable to fetch user from Clerk');
    }
  }
}
