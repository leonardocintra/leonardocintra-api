import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import { EnvService } from './config/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://gate.leonardocintra.com.br',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Aumenta o limite para JSON
  app.use(json({ limit: '2mb' }));

  app.useGlobalPipes(new ValidationPipe());

  const env = app.get(EnvService);
  await app.listen(env.PORT);
}
void bootstrap();
