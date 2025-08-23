import { createClerkClient, User } from '@clerk/backend';
import {
  ForbiddenException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import mqtt from 'mqtt';
import { LeadsService } from 'src/leads/leads.service';

@Injectable()
export class PortaoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PortaoService.name);

  private clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  private client: mqtt.MqttClient;
  private ultimoAcionamento: string | null = null;

  constructor(private readonly leadService: LeadsService) {}

  onModuleInit() {
    const brokerUrl =
      process.env.MQTT_BROKER_URL ||
      'mqtts://246bc5a388ec4e978794cc3efb0d83b5.s1.eu.hivemq.cloud:8883';

    const options = {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      rejectUnauthorized: false,
    };

    this.client = mqtt.connect(brokerUrl, options);

    this.client.on('connect', () => {
      this.logger.log('Conectado ao broker MQTT HiveMQ Cloud');

      // Escuta o feedback do ESP32
      this.client.subscribe('casa/portao/status', (err) => {
        if (err) {
          this.logger.error('Erro ao se inscrever em casa/portao/status:', err);
        } else {
          this.logger.log('Inscrito em casa/portao/status');
        }
      });
    });

    this.client.on('message', (topic, message) => {
      if (topic === 'casa/portao/status') {
        this.ultimoAcionamento = message.toString();
        this.logger.log(`Feedback do portão: ${this.ultimoAcionamento}`);
      }
    });

    this.client.on('error', (error) => {
      this.logger.error('Erro MQTT:', error);
    });

    this.client.on('disconnect', () => {
      this.logger.log('Desconectado do MQTT');
    });

    this.client.on('reconnect', () => {
      this.logger.log('Tentando reconectar MQTT...');
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
    }
  }

  private enviarComandoPortao(
    comando: string,
    acao: string,
  ): { success: boolean; status: string } {
    try {
      // Publica no tópico que o ESP32 está ouvindo
      this.client.publish('casa/portao', comando);
      this.logger.debug(`Comando enviado: ${acao} portão`);

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
    return { status: this.ultimoAcionamento };
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
