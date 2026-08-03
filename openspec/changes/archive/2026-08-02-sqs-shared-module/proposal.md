## Why

O consumo de filas SQS hoje está acoplado ao `SqsConsumerService` dentro de `src/cron/sqs-consumer/`, que mistura infraestrutura AWS (`AwsSqsService`) com lógica de negócio (webhook do Padre Ramon). O `AwsSqsService` em `src/aws/` provê apenas `receiveMessage` e `deleteMessage` — não há `sendMessage` nem `purgeQueue`. Qualquer novo módulo que precise enviar ou consumir mensagens SQS teria que importar `AwsModule` indiretamente via `CronModule`. Precisamos de um sub-módulo SQS reutilizável dentro do `AwsModule` que qualquer módulo NestJS possa importar para enviar e consumir mensagens de qualquer fila SQS, mantendo o `AwsModule` como umbrella para futuros produtos AWS (DynamoDB, S3, etc.).

## What Changes

- Criar `SqsModule` (`src/aws/sqs/sqs.module.ts`) como sub-módulo do `AwsModule`, exportando `SqsService` com operações genéricas de SQS (`sendMessage`, `receiveMessage`, `deleteMessage`, `purgeQueue`).
- Criar `SqsService` (`src/aws/sqs/sqs.service.ts`) encapsulando o `SQSClient` da AWS SDK v3 com métodos reutilizáveis parametrizáveis (queueUrl, messageBody, atributos, etc.).
- Criar interfaces de opções (`SqsReceiveOptions`, `SqsSendOptions`) permitindo que cada consumer defina seus próprios parâmetros de chamada.
- O `AwsModule` permancerá como módulo umbrella, importando e re-exportando `SqsModule` para que consumidores do `AwsModule` tenham acesso ao `SqsService`.
- Substituir `AwsSqsService` por `SqsService`: o `AwsSqsService` sera removido pois o `SqsService` cobre toda sua funcionalidade (e adiciona `sendMessage` e `purgeQueue`).
- Refatorar `SqsConsumerService` de `src/cron/sqs-consumer/` para usar `SqsService` em vez de `AwsSqsService`.
- **BREAKING**: `AwsSqsService` sera removido. O `AwsModule` continua existindo mas agora re-exporta `SqsModule` em vez de prover `AwsSqsService` diretamente.

## Capabilities

### New Capabilities
- `sqs-queue`: Sub-módulo SQS reutilizável dentro de `AwsModule` provendo operações de envio e consumo de mensagens para qualquer fila AWS SQS, configurável via parâmetros de método e utilizável por qualquer módulo NestJS que importe `AwsModule`.

### Modified Capabilities
- `cron-scheduler`: O `CronModule` continuará importando `AwsModule`, mas o `SqsConsumerService` passará a depender de `SqsService` (de `src/aws/sqs/sqs.service.ts`) em vez de `AwsSqsService`. Os requisitos de comportamento do cron job permanecem inalterados.

## Impact

- **Código afetado**: `src/aws/aws-sqs.service.ts` (removido), `src/aws/aws.module.ts` (atualizado para importar/re-exportar `SqsModule`), `src/cron/cron.module.ts` (sem mudança — continua importando `AwsModule`), `src/cron/sqs-consumer/sqs-consumer.service.ts` (troca dependência para `SqsService`).
- **Novos arquivos**: `src/aws/sqs/sqs.module.ts`, `src/aws/sqs/sqs.service.ts`, `src/aws/sqs/interfaces/sqs-receive-options.interface.ts`, `src/aws/sqs/interfaces/sqs-send-options.interface.ts`, `src/aws/sqs/constants/sqs.constants.ts`.
- **Dependências**: Nenhuma nova dependência — continua usando `@aws-sdk/client-sqs` já instalada.
- **Configuração**: `AWS_REGION` continua sendo usada; cada consumer define sua própria `queueUrl` via `ConfigService`.
- **Futuro**: O `AwsModule` poderá abrigar futuros sub-módulos AWS (ex.: `src/aws/dynamodb/`, `src/aws/s3/`). Próximos workers SQS poderão importar `AwsModule` diretamente sem acoplar a `CronModule`.
