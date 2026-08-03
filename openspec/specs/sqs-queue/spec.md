## Purpose

Definir os requisitos do sub-modulo SQS reutilizavel dentro do `AwsModule`, provendo operacoes genericas de envio e consumo de mensagens para qualquer fila AWS SQS, utilizavel por qualquer modulo NestJS que importe `AwsModule`.

## Requirements

### Requirement: Modulo SqsModule como sub-modulo do AwsModule
O sistema DEVE possuir um modulo `SqsModule` em `src/aws/sqs/sqs.module.ts` responsavel por prover o `SqsService`. O modulo DEVE importar `ConfigModule` para acesso ao `ConfigService`. O `AwsModule` (`src/aws/aws.module.ts`) DEVE importar e re-exportar o `SqsModule` para que qualquer modulo que importe `AwsModule` tenha acesso ao `SqsService`.

#### Scenario: SqsService injetavel via AwsModule
- **WHEN** um modulo qualquer (ex.: `CronModule`, futuro `WorkerModule`) importar `AwsModule`
- **THEN** o `SqsService` DEVE ser injetavel no construtor do service consumidor
- **AND** o modulo consumidor NAO DEVE precisar importar `SqsModule` explicitamente na lista de `imports`

#### Scenario: SqsModule registrou SqsService como provider
- **WHEN** a aplicacao inicializar
- **THEN** o `SqsModule` DEVE ter `SqsService` na lista de `providers`
- **AND** DEVE ter `SqsService` na lista de `exports`

#### Scenario: AwsModule re-exporta SqsModule
- **WHEN** a aplicacao inicializar
- **THEN** o `AwsModule` DEVE ter `SqsModule` na lista de `imports`
- **AND** DEVE ter `SqsModule` na lista de `exports`

### Requirement: SqsService com operacoes genericas de SQS
O `SqsService` em `src/aws/sqs/sqs.service.ts` DEVE encapsular o `SQSClient` da `@aws-sdk/client-sqs` e expor metodos genericos para operar em qualquer fila SQS. O `SQSClient` DEVE ser configurado com a regiao obtida de `ConfigService` (`AWS_REGION`, padrao `sa-east-1`).

#### Scenario: Metodo receiveMessage
- **WHEN** um consumer chamar `sqsService.receiveMessage(queueUrl, options?)`
- **THEN** o metodo DEVE executar `ReceiveMessageCommand` com a `queueUrl` fornecida
- **AND** DEVE respeitar `maxNumberOfMessages` (padrao 1), `waitTimeSeconds` (padrao 0) e `messageAttributeNames` (padrao `['All']`) se fornecidos via `options`
- **AND** DEVE retornar `Message | undefined` (primeira mensagem ou undefined se vazia)
- **AND** DEVE lancar erro se `queueUrl` for vazio ou undefined

#### Scenario: Metodo deleteMessage
- **WHEN** um consumer chamar `sqsService.deleteMessage(queueUrl, receiptHandle?)`
- **THEN** o metodo DEVE executar `DeleteMessageCommand` com os parametros fornecidos
- **AND** DEVE retornar `void` apos sucesso
- **AND** DEVE retornar silenciosamente (sem erro) se `queueUrl` ou `receiptHandle` for vazio

#### Scenario: Metodo sendMessage
- **WHEN** um consumer chamar `sqsService.sendMessage(queueUrl, messageBody, options?)`
- **THEN** o metodo DEVE executar `SendMessageCommand` com a `queueUrl` e `messageBody` fornecidos
- **AND** DEVE respeitar `delaySeconds` e `messageAttributes` se fornecidos via `options`
- **AND** DEVE retornar o `SendMessageCommandResult` (incluindo `MessageId`)
- **AND** DEVE lancar erro se `queueUrl` ou `messageBody` for vazio

#### Scenario: Metodo purgeQueue
- **WHEN** um consumer chamar `sqsService.purgeQueue(queueUrl)`
- **THEN** o metodo DEVE executar `PurgeQueueCommand` com a `queueUrl` fornecida
- **AND** DEVE lancar erro se `queueUrl` for vazio

#### Scenario: Tratamento de erros
- **WHEN** qualquer operacao SQS falhar (erro de rede, credenciais, fila inexistente)
- **THEN** o `SqsService` DEVE logar o erro via `Logger`
- **AND** DEVE relancar o erro para o caller tratar

### Requirement: Substituicao de AwsSqsService por SqsService
O sistema NAO DEVE mais conter `src/aws/aws-sqs.service.ts`. As funcionalidades anteriormente providas por `AwsSqsService` (`receiveMessage`, `deleteMessage`) DEVEM ser substituidas por metodos equivalentes no `SqsService` (em `src/aws/sqs/sqs.service.ts`). O `AwsModule` DEVE continuar existindo em `src/aws/aws.module.ts` como modulo umbrella de produtos AWS.

#### Scenario: AwsSqsService removido
- **WHEN** a refatoracao estiver completa
- **THEN** o arquivo `src/aws/aws-sqs.service.ts` NAO DEVE existir
- **AND** nenhum arquivo do projeto DEVE importar `AwsSqsService`
- **AND** o arquivo `src/aws/aws.module.ts` DEVE continuar existindo

### Requirement: Interface de opcoes de recebimento
O sistema DEVE possuir uma interface `SqsReceiveOptions` em `src/aws/sqs/interfaces/sqs-receive-options.interface.ts` definindo os parametros opcionais para `receiveMessage`: `maxNumberOfMessages`, `waitTimeSeconds`, `messageAttributeNames`.

#### Scenario: Opcoes aplicadas com valores padrao
- **WHEN** `receiveMessage` for chamado sem `options`
- **THEN** DEVE usar `maxNumberOfMessages: 1`, `waitTimeSeconds: 0`, `messageAttributeNames: ['All']`

#### Scenario: Opcoes aplicadas com valores customizados
- **WHEN** `receiveMessage` for chamado com `{ maxNumberOfMessages: 5, waitTimeSeconds: 10 }`
- **THEN** DEVE respeitar esses valores no comando SQS

### Requirement: Interface de opcoes de envio
O sistema DEVE possuir uma interface `SqsSendOptions` em `src/aws/sqs/interfaces/sqs-send-options.interface.ts` definindo os parametros opcionais para `sendMessage`: `delaySeconds`, `messageAttributes`.

#### Scenario: Opcoes de envio aplicadas com valores padrao
- **WHEN** `sendMessage` for chamado sem `options`
- **THEN** DEVE enviar sem `delaySeconds` e sem `messageAttributes`

#### Scenario: Opcoes de envio aplicadas com valores customizados
- **WHEN** `sendMessage` for chamado com `{ delaySeconds: 30, messageAttributes: { tipo: {...} } }`
- **THEN** DEVE respeitar esses valores no comando SQS
