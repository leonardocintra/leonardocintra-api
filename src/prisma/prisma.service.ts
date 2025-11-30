import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'prisma/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$queryRaw`SELECT 1`; // Simple query to test the connection
      Logger.log('Database connection established successfully.');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  }
}
