import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PortaoModule } from './automations/portao/portao.module';
import { APP_GUARD } from '@nestjs/core';
import { ClerkAuthGuard } from './auth/clerk/clerk.guard';
import { LeadsModule } from './leads/leads.module';
import { PrismaModule } from './prisma/prisma.module';
import { MqttModule } from './mqtt/mqtt.module';
import { BlogModule } from './blog/blog.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt/jwt.strategy';
import { JwtAuthGuard } from './auth/jwt/jwt.guard';
import { TokenController } from './auth/token/token.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresInConfig = configService.get<string | number>(
          'JWT_EXPIRES_IN',
        );
        const expiresIn =
          typeof expiresInConfig === 'number'
            ? expiresInConfig
            : Number(expiresInConfig);

        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: Number.isFinite(expiresIn) ? expiresIn : 3600,
          },
        };
      },
    }),
    PortaoModule,
    LeadsModule,
    PrismaModule,
    MqttModule,
    BlogModule,
  ],
  controllers: [AppController, TokenController],
  providers: [
    AppService,
    ClerkAuthGuard,
    JwtAuthGuard,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
