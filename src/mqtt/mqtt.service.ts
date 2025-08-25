import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import mqtt, { MqttClient } from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client: MqttClient;
  private ultimoStatus: string | null = null;

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
        this.ultimoStatus = message.toString();
        this.logger.log(`Feedback do portão: ${this.ultimoStatus}`);
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

  publish(topic: string, message: string) {
    if (!this.client || !this.client.connected) {
      this.logger.error('MQTT não conectado');
      throw new Error('MQTT não conectado');
    }
    this.client.publish(topic, message);
  }

  getUltimoStatus(): string | null {
    return this.ultimoStatus;
  }
}
