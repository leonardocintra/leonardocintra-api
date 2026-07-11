## Why

O consumo da fila SQS para registro de visita do Padre Ramon foi implementado dentro do `PadreRamonService` usando `CronJob` manual (`new CronJob(...)`), o que foge do padrão recomendado do NestJS e dificulta a manutenção. Além disso, mistura responsabilidades de domínio (registro de visita) com infraestrutura de agendamento (cron). Precisamos extrair essa lógica para um módulo de cron dedicado, que poderá abrigar outros jobs futuros, e usar o decorador `@Cron` nativo do `@nestjs/schedule`.

## What Changes

- Criar o módulo `src/cron/` com `CronModule` e `CronService` para centralizar todos os jobs agendados
- Extrair o consumo da fila SQS do `PadreRamonService` para um serviço dedicado dentro de `src/cron/`
- Remover `OnModuleInit` e `CronJob` manual do `PadreRamonService`, voltando-o a ser um service puro de domínio
- Usar o decorador `@Cron()` do `@nestjs/schedule` no novo serviço de cron
- Registrar `CronModule` no `AppModule`
- Mover o webhook POST do SQS para o novo módulo de cron (injetando `HttpService` e `AwsSqsService`)

## Capabilities

### New Capabilities

- `cron-scheduler`: Módulo centralizado de jobs agendados. Inicialmente abriga o job de consumo da fila SQS do Padre Ramon. Futuramente pode receber outros crons.

### Modified Capabilities

<!-- Nenhuma capability existente tem requisitos alterados – é apenas refatoração de implementação -->

## Impact

- **src/padre-ramon/padre-ramon.service.ts**: Remove `OnModuleInit`, `CronJob`, `processSqsQueue()`. Service volta a ter apenas `createRegistroVisita()`.
- **src/padre-ramon/padre-ramon.module.ts**: Remove dependências de `HttpModule` (será movido para cron). Mantém `AwsModule` se necessário apenas para injeção futura, mas idealmente remove.
- **src/cron/**: Novo módulo com `CronModule`, `CronService` (decorado com `@Cron`), e futuramente outros jobs.
- **src/app.module.ts**: Adiciona `CronModule` aos imports.
- **README.md**: Atualiza documentação sobre o novo módulo de cron.
