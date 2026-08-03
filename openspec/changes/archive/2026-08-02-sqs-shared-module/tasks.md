## 1. Criar estrutura do sub-módulo SqsModule dentro de src/aws/sqs/

- [x] 1.1 Criar `src/aws/sqs/interfaces/sqs-receive-options.interface.ts` com a interface `SqsReceiveOptions` definindo `maxNumberOfMessages?: number`, `waitTimeSeconds?: number`, `messageAttributeNames?: string[]`
- [x] 1.2 Criar `src/aws/sqs/interfaces/sqs-send-options.interface.ts` com a interface `SqsSendOptions` definindo `delaySeconds?: number`, `messageAttributes?: Record<string, MessageAttributeValue>`
- [x] 1.3 Criar `src/aws/sqs/constants/sqs.constants.ts` com constantes padrão (`DEFAULT_MAX_NUMBER_OF_MESSAGES = 1`, `DEFAULT_WAIT_TIME_SECONDS = 0`, `DEFAULT_MESSAGE_ATTRIBUTE_NAMES = ['All']`, `DEFAULT_AWS_REGION = 'sa-east-1'`)

## 2. Implementar SqsService

- [x] 2.1 Criar `src/aws/sqs/sqs.service.ts` com a classe `SqsService` injetando `ConfigService`, instanciando `SQSClient` com `AWS_REGION` (padrão `sa-east-1`)
- [x] 2.2 Implementar método `receiveMessage(queueUrl: string, options?: SqsReceiveOptions): Promise<Message | undefined>` usando `ReceiveMessageCommand` com valores padrão e opcionais da interface
- [x] 2.3 Implementar método `deleteMessage(queueUrl: string, receiptHandle?: string): Promise<void>` usando `DeleteMessageCommand`, retornando silenciosamente se parâmetros vazios
- [x] 2.4 Implementar método `sendMessage(queueUrl: string, messageBody: string, options?: SqsSendOptions): Promise<SendMessageCommandOutput>` usando `SendMessageCommand`
- [x] 2.5 Implementar método `purgeQueue(queueUrl: string): Promise<void>` usando `PurgeQueueCommand`
- [x] 2.6 Garantir que todos os métodos loguem erros via `Logger` e relancem exceções para o caller

## 3. Criar SqsModule

- [x] 3.1 Criar `src/aws/sqs/sqs.module.ts` decorado com `@Module({ imports: [ConfigModule], providers: [SqsService], exports: [SqsService] })`

## 4. Atualizar AwsModule como umbrella

- [x] 4.1 Em `src/aws/aws.module.ts`, remover `AwsSqsService` da lista de `providers` e `exports`
- [x] 4.2 Adicionar `SqsModule` na lista de `imports` e `exports` do `AwsModule`
- [x] 4.3 Remover a importação de `AwsSqsService` do arquivo

## 5. Migrar SqsConsumerService

- [x] 5.1 Em `src/cron/sqs-consumer/sqs-consumer.service.ts`, trocar a importação de `AwsSqsService` (`src/aws/aws-sqs.service`) para `SqsService` (`src/aws/sqs/sqs.service`)
- [x] 5.2 Trocar o tipo da dependência no construtor de `awsSqsService: AwsSqsService` para `sqsService: SqsService`
- [x] 5.3 Atualizar as chamadas de `this.awsSqsService.receiveMessage(...)` para `this.sqsService.receiveMessage(...)` e `this.awsSqsService.deleteMessage(...)` para `this.sqsService.deleteMessage(...)`
- [x] 5.4 Verificar que nenhum outro arquivo referencia `AwsSqsService`

## 6. Remover AwsSqsService antigo

- [x] 6.1 Deletar `src/aws/aws-sqs.service.ts`

## 7. Verificação

- [x] 7.1 Executar `npx tsc --noEmit` para verificar erros de tipo
- [x] 7.2 Executar `npm run build` para validar compilação
- [x] 7.3 Executar `npm run test` para validar testes existentes
- [x] 7.4 Verificar que `grep -r "AwsSqsService" src/` não retorna resultados
- [x] 7.5 Verificar que `src/aws/aws.module.ts` existe e re-exporta `SqsModule`
