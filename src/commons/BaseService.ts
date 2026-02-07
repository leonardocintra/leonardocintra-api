import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export abstract class BaseService {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly prismaService: PrismaService) {}
}
