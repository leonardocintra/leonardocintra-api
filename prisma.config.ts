import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';
import { ENV_KEYS } from './src/config/env.constants';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env(ENV_KEYS.DATABASE_URL),
  },
});
