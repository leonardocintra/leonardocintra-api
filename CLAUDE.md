# CLAUDE.md - Leonardo Cintra API

## Project Overview
NestJS v11 API (TypeScript) for Leonardo Cintra's personal services — blog, leads, WhatsApp messaging, MQTT, SQS, auth, automations, and file storage.

## Tech Stack
- **Framework**: NestJS 11 (Nest CLI, @nestjs/core, @nestjs/common)
- **Language**: Node 24.18+; TypeScript em dual-track: `typescript` (alias → TS 6.0, motor de build/teste) + `typescript-7` (TS 7.0 nativo Go, só typecheck)
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
npm run build         # Compile (nest build, motor TS 6.0)
npm run typecheck     # Typecheck gate com TS 7.0 (Go native, ~10x mais rápido)
npm run typecheck:legacy # Typecheck com tsc6 (para diff durante a transição)
npm run start         # Development
npm run start:dev     # Watch mode
npm run start:prod    # Production
npm run migrate:deploy # Prisma migrate deploy
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run check         # Biome check
```

## TypeScript dual-track (TS6 + TS7) — NÃO mudar sem entender
- `typescript` no `package.json` é o alias `npm:@typescript/typescript6@^6.0.2`. **Não trocar para `^7`**: `nest build`, `ts-jest` e `ts-node` usam a API programática do compilador, que o TS 7.0 **não expõe** (chega no 7.1).
- `typescript-7` é `npm:typescript@^7.0.2` (compilador nativo em Go, ~10x mais rápido) — usado **apenas** no script `typecheck`, que aponta direto para `node_modules/typescript-7/bin/tsc`. Motivo: o binário `tsc` do `.bin` resolve para `@typescript/old` (dependência interna do `@typescript/typescript6`), não para o TS7.
- `typecheck:legacy` roda o `tsc6` para comparar diagnósticos; remover quando o 7.1 + tooling suportarem o TS7 como motor.
- `tsconfig.json`: `module`/`moduleResolution` = `nodenext`; **sem `baseUrl`** (removido no TS7) — os aliases `src/*` e `prisma/*` vivem em `paths`. `types: ["node", "jest"]` é explícito (default do TS7 é `[]`). `isolatedModules: true` (exigido pelo ts-jest sob `nodenext`).

## Prisma 7 — gotcha de module format
- O generator `prisma-client` (Prisma 7) **infere** ESM quando o tsconfig usa `module: nodenext`, gerando client com `import.meta.url` → em runtime CJS quebra com `ReferenceError: exports is not defined in ES module scope`.
- **`moduleFormat = "cjs"` no generator `client` do [prisma/schema.prisma](prisma/schema.prisma) é obrigatório** (fix oficial, ver prisma/prisma#27556 e #29710).
- Sempre rodar `npx prisma generate` após mexer no schema.

## Known issues (pré-existentes, fora do escopo TS7)
- `npm run test` — não há testes unitários (0 `.spec.ts` em `src/`).
- `npm run test:e2e` — quebrado: jest não resolve imports `src/*` (falta `moduleNameMapper` no config jest).
- `npm run check` (Biome) — falha: `biome.json` usa schema 1.9.4, mas o Biome instalado é 2.x. Rodar `npx biome migrate`.
- `start:prod` (`node dist/main`) — o build gera `dist/src/main.js`; o caminho real é `node dist/src/main`.

## Conventions
- **No mocks in tests** — hit real DB when possible (team feedback).
- **Biome** for formatting + linting (not ESLint/Prettier).
- **Prisma** for DB — use the generated client from `src/prisma/prisma.service.ts`.
- **MultiAuthGuard** is global — individual controllers/modules can override with `@Public()` or specific guards.
- **CORS** is locked to `gate.leonardocintra.com.br` — don't widen without approval.
- **SQS messages** that fail are left in the queue for retry (error is logged, not consumed).

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `leonardocintra/leonardocintra-api`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` at the repo root, ADRs in `docs/adr/`. See `docs/agents/domain.md`.
