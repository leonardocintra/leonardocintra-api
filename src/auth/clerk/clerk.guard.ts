import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';
import { IS_PUBLIC_KEY } from 'src/decorators/public/public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verifica se a rota está marcada com o decorator @Public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Se for pública, permite o acesso sem verificar o token
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing.');
    }

    // O token é enviado como "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Bearer token is missing.');
    }

    try {
      const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
      if (!secretKey) {
        throw new Error('CLERK_SECRET_KEY not found in environment variables.');
      }

      // Usa a função verifyToken do SDK do Clerk para validar o JWT
      const claims = await verifyToken(token, {
        secretKey: secretKey,
      });

      // Anexa os dados do usuário (claims do token) à requisição
      // para que possam ser acessados nos controllers
      request.user = claims;

      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}
