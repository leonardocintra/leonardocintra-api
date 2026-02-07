import { Controller, Post } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { IsPublic } from 'src/decorators/public/public.decorator';

@Controller('token')
@IsPublic()
export class TokenController {
  @Post()
  generateToken() {
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    return {
      token,
      tokenHash,
    };
  }
}
