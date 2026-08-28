# CLAUDE.md - Leonardo Cintra API

## Project Overview
NestJS v11 API (TypeScript) for Leonardo Cintra's personal services — blog, leads, WhatsApp messaging, MQTT, SQS, auth, automations, and file storage.

## Tech Stack
- **Framework**: NestJS 11 (Nest CLI, @nestjs/core, @nestjs/common)
- **Language**: TypeScript 5.7, Node 24.18+
- **Database**: PostgreSQL via Prisma 7 (adapter-pg)
- **Auth**: Clerk (backend SDK) + JWT (passport-jwt) via MultiAuthGuard
- **Queue/Events**: AWS SQS (@aws-sdk/client-sqs), MQTT (HiveMQ)
- **Storage**: MinIO
- **Messaging**: WhatsApp via Evolution API
- **Formatting/Linting**: Biome
- **Testing**: Jest (unit + e2e)

## Key Modules (src/)
| Module | Purpose |
|---|---|
| `auth/` | Clerk auth guard, JWT guard/strategy, token controller |
| `automations/portao/` | Gate/door automation |
| `blog/` | Blog posts CRUD |
| `cron/` | Scheduled SQS consumer |
| `leads/` | Lead management |
| `minio/` | File storage on MinIO |
| `mqtt/` | MQTT broker integration |
| `padre-ramon/` | Visit registration, SQS consumption, webhook forwarding |
| `prisma/` | Prisma client singleton |
| `whatsapp/` | WhatsApp messaging via Evolution API |
| `worker/` | Background cron & WhatsApp workers |
| `afiliados/` | Affiliate program (Avisei Preco Bom) |

## Important Files
- `src/main.ts` — Bootstrap, CORS (origin: `gate.leonardocintra.com.br`), validation pipe, body limit 2MB
- `src/app.module.ts` — Root module; `MultiAuthGuard` is global (`APP_GUARD`)
- `src/config/env.service.ts` — Typed env service (uses `@nestjs/config`)
- `prisma/schema.prisma` — Database schema
- `.env.sample` — All env vars with defaults

## Env Vars (key ones)
- `DATABASE_URL` — PostgreSQL connection string
- `CLERK_SECRET_KEY`, `JWT_SECRET` — Auth
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SQS_BASE_URL` — AWS
- `MQTT_BROKER_URL`, `MQTT_USERNAME`, `MQTT_PASSWORD` — MQTT
- `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` — WhatsApp
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET` — Storage
- `PADRE_RAMON_SQS_QUEUE_NAME`, `PADRE_RAMON_SQS_CRON` — SQS cron config

## Commands
```bash
npm install          # Install + prisma generate
npm run build         # Compile
npm run start         # Development
npm run start:dev     # Watch mode
npm run start:prod    # Production
npm run migrate:deploy # Prisma migrate deploy
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run check         # Biome check
```

## Conventions
- **No mocks in tests** — hit real DB when possible (team feedback).
- **Biome** for formatting + linting (not ESLint/Prettier).
- **Prisma** for DB — use the generated client from `src/prisma/prisma.service.ts`.
- **MultiAuthGuard** is global — individual controllers/modules can override with `@Public()` or specific guards.
- **CORS** is locked to `gate.leonardocintra.com.br` — don't widen without approval.
- **SQS messages** that fail are left in the queue for retry (error is logged, not consumed).
