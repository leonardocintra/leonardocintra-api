import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import mqtt from 'mqtt';

@Injectable()
export class LampService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private lampStatus: 'on' | 'off' = 'off';

  onModuleInit() {
    // Conecta ao broker MQTT HiveMQ Cloud
    const brokerUrl =
      'mqtts://246bc5a388ec4e978794cc3efb0d83b5.s1.eu.hivemq.cloud:8883';
    const options = {
      username: 'hivemq.webclient.1755443398662', // Substitua pelo seu usuário
      password: 'Bm,b.?ogdJi8M2!3I6AQ', // Substitua pela sua senha
      rejectUnauthorized: false, // Aceita certificados autoassinados
    };

    this.client = mqtt.connect(brokerUrl, options);

    this.client.on('connect', () => {
      console.log('Conectado ao broker MQTT HiveMQ Cloud');
    });

    this.client.on('error', (error) => {
      console.error('Erro MQTT:', error);
    });

    this.client.on('disconnect', () => {
      console.log('Desconectado do MQTT');
    });

    this.client.on('reconnect', () => {
      console.log('Tentando reconectar MQTT...');
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
    }
  }

  toggleLamp(status: 'on' | 'off'): { success: boolean; status: string } {
    try {
      // Publica no tópico que o ESP32 está ouvindo
      this.client.publish('casa/lampada', status);
      this.lampStatus = status;

      console.log(`Lâmpada ${status === 'on' ? 'ligada' : 'desligada'}`);

      return {
        success: true,
        status: status,
      };
    } catch (error) {
      console.error('Erro ao controlar lâmpada:', error);
      return {
        success: false,
        status: this.lampStatus,
      };
    }
  }

  getLampStatus(): { status: string } {
    return { status: this.lampStatus };
  }
}
