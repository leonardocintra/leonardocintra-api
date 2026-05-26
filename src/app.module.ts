import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClerkAuthGuard } from './auth/clerk/clerk.guard';
import { MultiAuthGuard } from './auth/guards/multi-auth.guard';
import { JwtAuthGuard } from './auth/jwt/jwt.guard';
import { JwtStrategy } from './auth/jwt/jwt.strategy';
import { TokenController } from './auth/token/token.controller';
import { PortaoModule } from './automations/portao/portao.module';
import { BlogModule } from './blog/blog.module';
import { LeadsModule } from './leads/leads.module';
import { MqttModule } from './mqtt/mqtt.module';
import { PrismaModule } from './prisma/prisma.module';
import { PoscrismaModule } from './poscrisma/poscrisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresInConfig = configService.get<string | number>('JWT_EXPIRES_IN');
        const expiresIn =
          typeof expiresInConfig === 'number' ? expiresInConfig : Number(expiresInConfig);

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
    PoscrismaModule,
  ],
  controllers: [AppController, TokenController],
  providers: [
    AppService,
    ClerkAuthGuard,
    JwtAuthGuard,
    JwtStrategy,
    MultiAuthGuard,
    {
      provide: APP_GUARD,
      useClass: MultiAuthGuard,
    },
  ],
})
export class AppModule { }
