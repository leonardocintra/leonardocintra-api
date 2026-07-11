## Context

Atualmente o `PadreRamonService` implementa `OnModuleInit` e instancia manualmente um `CronJob` do `@nestjs/schedule` para consumir a fila SQS a cada 1h. Esse padrão:

1. Mistura responsabilidade de domínio (registro de visita) com infraestrutura de agendamento
2. Usa `new CronJob(...)` + `start()` manual em vez do decorador `@Cron()` nativo
3. Depende de `HttpModule` e `AwsSqsService` que só são necessários para o job agendado
4. Impede centralização de outros jobs futuros

O `@nestjs/schedule` já está instalado (`^6.1.3`) e o `ScheduleModule.forRoot()` já está registrado no `AppModule`.

## Goals / Non-Goals

**Goals:**
- Criar um módulo `CronModule` em `src/cron/` que centralize todos os jobs agendados da aplicação
- Extrair o job SQS do `PadreRamonService` para `cron/sqs-consumer/sqs-consumer.service.ts`
- Usar o decorador `@Cron()` do `@nestjs/schedule` no novo serviço
- Remover `OnModuleInit` e `CronJob` manual do `PadreRamonService`
- Manter a expressão cron configurável via env `PADRE_RAMON_SQS_CRON`

**Non-Goals:**
- Não alterar a lógica de negócio do webhook POST (payload, URL, deleção condicional)
- Não criar testes unitários ou e2e
- Não implementar outros jobs além do SQS consumer neste momento
- Não modificar o `AwsSqsService` ou `AwsModule`

## Decisions

### 1. Usar decorador `@Cron()` com `SchedulerRegistry` para cron dinâmico

**Decisão:** Criar um serviço (`SqsConsumerService`) que usa `@Cron()` com um cron fixo como fallback, mas registrar dinamicamente o job via `SchedulerRegistry` para permitir configuração por env.

**Alternativa considerada:** Usar `@Cron()` fixo com valor default e sobrescrever via `SchedulerRegistry` no `OnModuleInit`. Optou-se por manter o registro via `SchedulerRegistry` porque a expressão cron precisa vir de variável de ambiente (`PADRE_RAMON_SQS_CRON`), e o decorador `@Cron()` não aceita valores dinâmicos em tempo de execução.

### 2. Estrutura de diretórios do módulo `cron`

**Decisão:**
```
src/cron/
  cron.module.ts          – define o módulo, declara serviços, importa dependências
  cron.service.ts         – (opcional) serviço base compartilhado entre jobs
  sqs-consumer/
    sqs-consumer.service.ts  – job de consumo da fila SQS
```

Cada job futuro terá sua própria pasta dentro de `src/cron/`.

### 3. Injeção de dependências no SqsConsumerService

**Decisão:** O `SqsConsumerService` receberá `ConfigService`, `AwsSqsService` e `HttpService` diretamente. O `PadreRamonModule` não precisará mais importar `HttpModule` nem `AwsModule`.

### 4. Remoção do `HttpModule` do `PadreRamonModule`

**Decisão:** Como o job SQS sai do `PadreRamonService`, o `PadreRamonModule` não precisará mais de `HttpModule`. A dependência `AwsModule` também pode ser removida, a menos que o service precise para outro fim (não é o caso atualmente).

## Risks / Trade-offs

- [Baixo] **Job registrado dinamicamente via `SchedulerRegistry` não aparece em logs de inicialização do `@nestjs/schedule`** → Mitigação: o próprio `SqsConsumerService` loga quando o job é registrado e iniciado.
- [Baixo] **Módulo `cron` precisa importar `HttpModule` e `AwsModule`, o que o acopla a infraestrutura externa** → Aceitável: módulo de cron é por definição um módulo de infraestrutura.
- [Médio] **Se o `PadreRamonModule` não existir, o cron tenta usar `AwsSqsService` que ainda depende de módulo ativo** → O `AwsModule` é global no sentido de ser importado onde precisa; o `CronModule` importa `AwsModule` diretamente, independente do `PadreRamonModule`.
