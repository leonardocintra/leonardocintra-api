import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, isObservable, lastValueFrom } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/decorators/public/public.decorator';
import { ClerkAuthGuard } from '../clerk/clerk.guard';
import { JwtAuthGuard } from '../jwt/jwt.guard';

type GuardResult = boolean | Promise<boolean> | Observable<boolean>;

@Injectable()
export class MultiAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly clerkAuthGuard: ClerkAuthGuard,
    private readonly jwtAuthGuard: JwtAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    if (await this.tryActivate(this.clerkAuthGuard, context)) {
      return true;
    }

    if (await this.tryActivate(this.jwtAuthGuard, context)) {
      return true;
    }

    throw new UnauthorizedException('Invalid or expired token.');
  }

  private async tryActivate(
    guard: CanActivate,
    context: ExecutionContext,
  ): Promise<boolean> {
    try {
      const result = guard.canActivate(context) as GuardResult;
      return await this.unwrapResult(result);
    } catch {
      return false;
    }
  }

  private async unwrapResult(result: GuardResult): Promise<boolean> {
    if (result instanceof Promise) {
      return await result;
    }

    if (isObservable(result)) {
      return lastValueFrom(result);
    }

    return result;
  }
}
