import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import mqtt, { type MqttClient } from 'mqtt';
import { EnvService } from 'src/config/env.service';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client?: MqttClient;
  private ultimoStatus: string | null = null;

  constructor(private readonly env: EnvService) {}

  onModuleInit() {
    const brokerUrl = this.env.MQTT_BROKER_URL as string;

    const options = {
      username: this.env.MQTT_USERNAME,
      password: this.env.MQTT_PASSWORD,
      rejectUnauthorized: false,
    };

    const client = mqtt.connect(brokerUrl, options);
    this.client = client;

    client.on('connect', () => {
      this.logger.log('Conectado ao broker MQTT HiveMQ Cloud');
      client.subscribe('casa/portao/status', (err) => {
        if (err) {
          this.logger.error('Erro ao se inscrever em casa/portao/status:', err);
        } else {
          this.logger.log('Inscrito em casa/portao/status');
        }
      });
    });

    client.on('message', (topic, message) => {
      if (topic === 'casa/portao/status') {
        this.ultimoStatus = message.toString();
        this.logger.log(`Feedback do portão: ${this.ultimoStatus}`);
      }
    });

    client.on('error', (error) => {
      this.logger.error('Erro MQTT:', error);
    });

    client.on('disconnect', () => {
      this.logger.log('Desconectado do MQTT');
    });

    client.on('reconnect', () => {
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
