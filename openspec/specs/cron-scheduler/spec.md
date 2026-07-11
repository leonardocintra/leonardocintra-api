## Purpose

Definir os requisitos do agendamento centralizado de jobs cron da aplicacao, incluindo o consumidor SQS do modulo Padre Ramon.

## Requirements

### Requirement: Modulo centralizado de cron jobs
O sistema DEVE possuir um modulo `CronModule` em `src/cron/` responsavel por registrar e gerenciar todos os jobs agendados da aplicacao. O modulo DEVE importar `HttpModule`, `AwsModule` e `ScheduleModule` conforme necessario para cada job.

#### Scenario: Modulo registrado no AppModule
- **WHEN** a aplicacao inicializar
- **THEN** o `CronModule` DEVE estar importado no `AppModule`
- **AND** todos os jobs declarados no modulo DEVEM ser agendados automaticamente

### Requirement: Job SQS consumer com @Cron() configuravel
O job de consumo da fila SQS do Padre Ramon DEVE ser movido do `PadreRamonService` para `src/cron/sqs-consumer/sqs-consumer.service.ts`. O job DEVE usar o decorador `@Cron()` ou registro dinamico via `SchedulerRegistry` com a expressao cron vinda da env `PADRE_RAMON_SQS_CRON` (padrao `0 0 * * * *`).

#### Scenario: Job registrado com expressao padrao
- **WHEN** a env `PADRE_RAMON_SQS_CRON` nao estiver definida
- **THEN** o cron DEVE usar `0 0 * * * *` (a cada hora no minuto zero)

#### Scenario: Job registrado com expressao personalizada
- **WHEN** a env `PADRE_RAMON_SQS_CRON` estiver definida como `0 */30 * * * *`
- **THEN** o cron DEVE executar a cada 30 minutos

#### Scenario: Job executa o fluxo completo
- **WHEN** o cron disparar
- **THEN** o servico DEVE ler a fila SQS via `AwsSqsService.receiveMessage()`
- **AND** DEVE fazer POST para o webhook configurado
- **AND** DEVE deletar a mensagem da fila somente apos sucesso do POST
- **AND** DEVE logar erros sem deletar a mensagem em caso de falha

#### Scenario: Job nao executa sem queue URL
- **WHEN** a env `PADRE_RAMON_SQS_QUEUE_URL` nao estiver configurada
- **THEN** o cron DEVE logar um aviso e pular a execucao sem erro

### Requirement: PadreRamonService sem responsabilidade de cron
O `PadreRamonService` NAO DEVE mais conter logica de agendamento (`OnModuleInit`, `CronJob`, `processSqsQueue`). Ele DEVE permanecer apenas com o metodo `createRegistroVisita()` e suas dependencias originais (`PrismaService`).

#### Scenario: PadreRamonService limpo
- **WHEN** a aplicacao inicializar
- **THEN** o `PadreRamonService` NAO DEVE implementar `OnModuleInit`
- **AND** NAO DEVE importar `CronJob` de `@nestjs/schedule`
- **AND** NAO DEVE importar `HttpService` de `@nestjs/axios`
- **AND** NAO DEVE importar `AwsSqsService`

### Requirement: Cron module exposto globalmente
O `CronModule` DEVE ser importado no `AppModule` para que os jobs sejam registrados na inicializacao da aplicacao.

#### Scenario: AppModule importa CronModule
- **WHEN** a aplicacao e iniciada
- **THEN** o `AppModule` DEVE conter `CronModule` na lista de `imports`
