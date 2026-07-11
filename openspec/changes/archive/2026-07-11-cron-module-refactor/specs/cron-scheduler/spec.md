## ADDED Requirements

### Requirement: Módulo centralizado de cron jobs
O sistema DEVE possuir um módulo `CronModule` em `src/cron/` responsável por registrar e gerenciar todos os jobs agendados da aplicação. O módulo DEVE importar `HttpModule`, `AwsModule` e `ScheduleModule` conforme necessário para cada job.

#### Scenario: Módulo registrado no AppModule
- **WHEN** a aplicação inicializar
- **THEN** o `CronModule` DEVE estar importado no `AppModule`
- **AND** todos os jobs declarados no módulo DEVEM ser agendados automaticamente

### Requirement: Job SQS consumer com @Cron() configurável
O job de consumo da fila SQS do Padre Ramon DEVE ser movido do `PadreRamonService` para `src/cron/sqs-consumer/sqs-consumer.service.ts`. O job DEVE usar o decorador `@Cron()` ou registro dinâmico via `SchedulerRegistry` com a expressão cron vinda da env `PADRE_RAMON_SQS_CRON` (padrão `0 0 * * * *`).

#### Scenario: Job registrado com expressão padrão
- **WHEN** a env `PADRE_RAMON_SQS_CRON` não estiver definida
- **THEN** o cron DEVE usar `0 0 * * * *` (a cada hora no minuto zero)

#### Scenario: Job registrado com expressão personalizada
- **WHEN** a env `PADRE_RAMON_SQS_CRON` estiver definida como `0 */30 * * * *`
- **THEN** o cron DEVE executar a cada 30 minutos

#### Scenario: Job executa o fluxo completo
- **WHEN** o cron disparar
- **THEN** o serviço DEVE ler a fila SQS via `AwsSqsService.receiveMessage()`
- **AND** DEVE fazer POST para o webhook configurado
- **AND** DEVE deletar a mensagem da fila somente após sucesso do POST
- **AND** DEVE logar erros sem deletar a mensagem em caso de falha

#### Scenario: Job não executa sem queue URL
- **WHEN** a env `PADRE_RAMON_SQS_QUEUE_URL` não estiver configurada
- **THEN** o cron DEVE logar um aviso e pular a execução sem erro

### Requirement: PadreRamonService sem responsabilidade de cron
O `PadreRamonService` NÃO DEVE mais conter lógica de agendamento (`OnModuleInit`, `CronJob`, `processSqsQueue`). Ele DEVE permanecer apenas com o método `createRegistroVisita()` e suas dependências originais (`PrismaService`).

#### Scenario: PadreRamonService limpo
- **WHEN** a aplicação inicializar
- **THEN** o `PadreRamonService` NÃO DEVE implementar `OnModuleInit`
- **AND** NÃO DEVE importar `CronJob` de `@nestjs/schedule`
- **AND** NÃO DEVE importar `HttpService` de `@nestjs/axios`
- **AND** NÃO DEVE importar `AwsSqsService`

### Requirement: Cron module exposto globalmente
O `CronModule` DEVE ser importado no `AppModule` para que os jobs sejam registrados na inicialização da aplicação.

#### Scenario: AppModule importa CronModule
- **WHEN** a aplicação é iniciada
- **THEN** o `AppModule` DEVE conter `CronModule` na lista de `imports`
