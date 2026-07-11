## 1. Criar estrutura do módulo cron

- [x] 1.1 Criar diretório `src/cron/` com `cron.module.ts`, `cron.service.ts` e `sqs-consumer/sqs-consumer.service.ts`
- [x] 1.2 Implementar `CronModule` importando `HttpModule`, `AwsModule`, `ScheduleModule` e declarando `SqsConsumerService`

## 2. Implementar SqsConsumerService

- [x] 2.1 Criar `SqsConsumerService` em `src/cron/sqs-consumer/sqs-consumer.service.ts` com `OnModuleInit`
- [x] 2.2 Injetar `ConfigService`, `AwsSqsService`, `HttpService`, `SchedulerRegistry` no construtor
- [x] 2.3 No `onModuleInit()`, ler `PADRE_RAMON_SQS_CRON` (default `0 0 * * * *`) e ajustar o job registrado por `@Cron` via `SchedulerRegistry.getCronJob()` + `setTime()` + `job.start()`
- [x] 2.4 Extrair o método `processSqsQueue()` do `PadreRamonService` para o `SqsConsumerService` (mesma lógica: receber mensagem, fazer POST, deletar só após sucesso, logar erros)
- [x] 2.5 Manter a URL do webhook e a lógica de `type: 'registro-visita'` idênticas ao atual

## 3. Limpar PadreRamonService

- [x] 3.1 Remover `OnModuleInit` da declaração da classe (remover `implements OnModuleInit`)
- [x] 3.2 Remover campo `cronJob`, constante `CRON_JOB_NAME`, campo `webhookUrl`
- [x] 3.3 Remover método `onModuleInit()` e `processSqsQueue()`
- [x] 3.4 Remover imports: `OnModuleInit`, `HttpService`, `ConfigService`, `CronJob` (`from '@nestjs/schedule'`), `firstValueFrom`, `rxjs`, `Message` (`from '@aws-sdk/client-sqs'`), `AwsSqsService`
- [x] 3.5 Remover `AwsSqsService` do construtor (manter só `PrismaService`)
- [x] 3.6 Verificar se `ConfigService` ainda é usado; se não, remover também

## 4. Limpar PadreRamonModule

- [x] 4.1 Remover import de `HttpModule` e `AwsModule` do `PadreRamonModule`
- [x] 4.2 Remover `HttpModule` e `AwsModule` da lista `imports: []`

## 5. Registrar CronModule no AppModule

- [x] 5.1 Importar `CronModule` e adicionar em `imports: []` do `AppModule`

## 6. Verificar build e consistência

- [x] 6.1 Executar `npm run build` para verificar erros de compilação
- [x] 6.2 Corrigir eventuais erros de importação ou injeção
