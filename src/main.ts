import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

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

  await app.listen(process.env.PORT ?? 3005);
}
void bootstrap();
