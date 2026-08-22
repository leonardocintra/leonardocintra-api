import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_DEFAULTS, ENV_KEYS } from './env.constants';

@Injectable()
export class EnvService {
  constructor(private readonly configService: ConfigService) {}

  get AVISEI_PRECO_BOM_AFILIADOS_ID_SQS_QUEUE_NAME() {
    return this.configService.get<string>(ENV_KEYS.AVISEI_PRECO_BOM_AFILIADOS_ID_SQS_QUEUE_NAME);
  }

  get AVISEI_PRECO_BOM_ENABLED() {
    return this.configService.get<string>(
      ENV_KEYS.AVISEI_PRECO_BOM_ENABLED,
      ENV_DEFAULTS.AVISEI_PRECO_BOM_ENABLED,
    );
  }

  get AVISEI_PRECO_BOM_MENSAGENS_SQS_QUEUE_NAME() {
    return this.configService.get<string>(ENV_KEYS.AVISEI_PRECO_BOM_MENSAGENS_SQS_QUEUE_NAME);
  }

  get AWS_REGION() {
    return this.configService.get<string>(ENV_KEYS.AWS_REGION);
  }

  get AWS_SQS_BASE_URL() {
    return this.configService.get<string>(ENV_KEYS.AWS_SQS_BASE_URL);
  }

  get CLERK_SECRET_KEY() {
    return this.configService.get<string>(ENV_KEYS.CLERK_SECRET_KEY);
  }

  get DATABASE_URL() {
    return this.configService.get<string>(ENV_KEYS.DATABASE_URL);
  }

  get EVOLUTION_ALLOWED_GROUPS() {
    return this.configService.get<string>(ENV_KEYS.EVOLUTION_ALLOWED_GROUPS);
  }

  get EVOLUTION_API_KEY() {
    return this.configService.get<string>(ENV_KEYS.EVOLUTION_API_KEY);
  }

  get EVOLUTION_API_URL() {
    return this.configService.get<string>(ENV_KEYS.EVOLUTION_API_URL);
  }

  get EVOLUTION_INSTANCE_JULIANA_ID() {
    return this.configService.get<string>(ENV_KEYS.EVOLUTION_INSTANCE_JULIANA_ID);
  }

  get EVOLUTION_INSTANCE_LEONARDO_ID() {
    return this.configService.get<string>(ENV_KEYS.EVOLUTION_INSTANCE_LEONARDO_ID);
  }

  get EVOLUTION_WHATSAPP_NUMBER() {
    return this.configService.get<string>(ENV_KEYS.EVOLUTION_WHATSAPP_NUMBER);
  }

  get JWT_EXPIRES_IN() {
    return this.configService.get<string>(ENV_KEYS.JWT_EXPIRES_IN);
  }

  get JWT_SECRET() {
    return this.configService.get<string>(ENV_KEYS.JWT_SECRET);
  }

  get LEONARDO_N8N_WEBHOOK_URL() {
    return this.configService.get<string>(ENV_KEYS.LEONARDO_N8N_WEBHOOK_URL);
  }

  get MINIO_ACCESS_KEY() {
    return this.configService.get<string>(ENV_KEYS.MINIO_ACCESS_KEY);
  }

  get MINIO_BUCKET() {
    return this.configService.get<string>(ENV_KEYS.MINIO_BUCKET);
  }

  get MINIO_ENDPOINT() {
    return this.configService.get<string>(ENV_KEYS.MINIO_ENDPOINT);
  }

  get MINIO_PORT() {
    return this.configService.get<string>(ENV_KEYS.MINIO_PORT);
  }

  get MINIO_SECRET_KEY() {
    return this.configService.get<string>(ENV_KEYS.MINIO_SECRET_KEY);
  }

  get MINIO_USE_SSL() {
    return this.configService.get<string>(ENV_KEYS.MINIO_USE_SSL);
  }

  get MQTT_BROKER_URL() {
    return this.configService.get<string>(ENV_KEYS.MQTT_BROKER_URL);
  }

  get MQTT_PASSWORD() {
    return this.configService.get<string>(ENV_KEYS.MQTT_PASSWORD);
  }

  get MQTT_USERNAME() {
    return this.configService.get<string>(ENV_KEYS.MQTT_USERNAME);
  }

  get PADRE_RAMON_SQS_CRON() {
    return this.configService.get<string>(ENV_KEYS.PADRE_RAMON_SQS_CRON);
  }

  get PADRE_RAMON_SQS_QUEUE_NAME() {
    return this.configService.get<string>(ENV_KEYS.PADRE_RAMON_SQS_QUEUE_NAME);
  }

  get PORT() {
    return this.configService.get<string | number>(ENV_KEYS.PORT, ENV_DEFAULTS.PORT);
  }
}
