import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    this.logger.log('Fetching all leads');
    return this.prisma.leads.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  findByEmail(email: string) {
    this.logger.log(`Finding lead by email: ${email}`);
    return this.prisma.leads.findFirst({
      where: {
        email,
      },
    });
  }
}
