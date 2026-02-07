import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { Request } from 'express';
import { ApiClient } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

type RequestWithApiClient = Request & { apiClient?: ApiClient };

@Injectable()
export class ApiTokenGuard implements CanActivate {
  protected readonly logger = new Logger(ApiTokenGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const request = ctx.switchToHttp().getRequest<RequestWithApiClient>();

    const authHeader = request.headers.authorization;
    if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return false;
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');

    try {
      const client = await this.prisma.apiClient.findUnique({
        where: { tokenHash },
      });

      if (!client || !client.isActive) {
        return false;
      }

      request.apiClient = client;
      return true;
    } catch {
      return false;
    }
  }
}
