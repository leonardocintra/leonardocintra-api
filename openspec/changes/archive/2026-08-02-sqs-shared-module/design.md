## Context

O projeto possui hoje uma arquitetura acoplada para consumo de SQS: o `AwsSqsService` (em `src/aws/`) provê operações de baixo nível (`receiveMessage`, `deleteMessage`) e o `SqsConsumerService` (em `src/cron/sqs-consumer/`) contém a lógica de negócio específica do Padre Ramon (ler fila, fazer POST para webhook, deletar mensagem). O `CronModule` importa `AwsModule` para ter acesso ao `AwsSqsService`.

Isso funciona para um único consumer, mas impede reutilização: o `AwsSqsService` é um service flat em `src/aws/` sem separação de responsabilidades por produto AWS. O projeto planeja futuramente criar um worker dedicado para outra fila SQS e pode vir a usar outros produtos AWS (DynamoDB, S3). É necessário organizar o `AwsModule` como umbrella de produtos AWS, começando por um sub-módulo `SqsModule` que centralize toda a operação com SQS.

Stack atual: NestJS, TypeScript, `@aws-sdk/client-sqs` v3, `@nestjs/config` para configuração, `@nestjs/schedule` para cron jobs.

## Goals / Non-Goals

**Goals:**
- Criar um `SqsModule` compartilhado e reutilizável dentro de `src/aws/sqs/` que qualquer módulo NestJS pueda usar para operar com filas SQS.
- Encapsular o `SQSClient` em um `SqsService` com métodos genéricos tipados.
- Suportar múltiplas filas SQS com configurações independentes (cada consumer define sua `queueUrl` e parâmetros).
- Manter o `AwsModule` como módulo umbrella de produtos AWS, re-exportando `SqsModule`.
- Manter compatibilidade de comportamento com o consumer existente do Padre Ramon (sem mudança funcional).
- Preparar a estrutura `src/aws/<produto>/` para futuros sub-módulos AWS (DynamoDB, S3, etc.).

**Non-Goals:**
- Não criar um sistema de filas abstrato com adapters para outros provedores (SNS, RabbitMQ, etc.) — apenas SQS.
- Não implementar long polling ou listeners contínuos agora — o consumer atual usa cron-based polling e isso permanece.
- Não criar o novo worker SQS agora — apenas preparar a infraestrutura para que ele possa ser criado no futuro.
- Não adicionar retry policy, dead-letter queue handling ou backoff exponencial — isso pertence ao consumer de cada fila, não ao módulo compartilhado.
- Não criar sub-módulos para DynamoDB ou S3 agora — apenas preparar a estrutura de diretório para que sejam adicionados no futuro.

## Decisions

### Decision 1: `SqsModule` como sub-módulo dentro de `src/aws/sqs/` em vez de `src/sqs/`

**Escolhido**: `SqsModule` em `src/aws/sqs/sqs.module.ts`, agrupado sob o `AwsModule`.

**Rationale**: SQS é um produto da AWS. Agrupar produtos AWS sob `src/aws/<produto>/` segue o princípio de coesão por provedor de cloud e prepara o terreno para futuros produtos (DynamoDB em `src/aws/dynamodb/`, S3 em `src/aws/s3/`). O `AwsModule` atua como umbrella, importando e re-exportando `SqsModule`.

**Alternativas consideradas**:
- `SqsModule` em `src/sqs/` standalone: desacoplado do provedor AWS, mas SQS é intrinsecamente um produto AWS. Separar criaria a ilusão de que o módulo é provider-agnostic quando não é.
- Flat `src/aws/aws-sqs.service.ts` mantido e apenas expandido: não resolve o problema de not being importable/reusable como módulo independente.

### Decision 2: `AwsModule` como umbrella re-exportando `SqsModule` vs `SqsModule` global standalone

**Escolhido**: `AwsModule` importa e re-exporta `SqsModule`. `SqsModule` não é `@Global()` — consumidores importam `AwsModule` que por sua vez re-exporta `SqsModule`.

**Rationale**: O `CronModule` já importa `AWSModule` hoje. Mantendo esse padrão, a migração é apenas trocar a injeção de `AwsSqsService` para `SqsService` — sem mudar imports do `CronModule`. O `AwsModule` continua sendo o ponto único de entrada para qualquer produto AWS. Se no futuro `DynamoModule` for criado dentro de `src/aws/dynamodb/`, o `AwsModule` o re-exportá da mesma forma.

**Alternativas consideradas**:
- `SqsModule` com `@Global()`: dispensaria import explícito, mas mascararia dependências e tornaria `AwsModule` redundante como umbrella. Também violaria o princípio de que módulos globais devem ser truly cross-cutting (como ConfigModule), não produto-específicos.
- `SqsModule` em `src/sqs/` importado diretamente por cada consumer: quebraria a coesão AWS e obrigaria cada consumer a saber do `SqsModule` em vez de depender do `AwsModule` como façade.

### Decision 3: `SqsService` como classe única com métodos parametrizados

**Escolhido**: Classe única com parâmetros por método.

**Rationale**: O `SQSClient` da AWS SDK já é stateless — cada comando leva `QueueUrl` como parâmetro. Não há estado por-fila no client. O `SqsService` expõe métodos que recebem `queueUrl` e opções como parâmetros, permitindo que qualquer consumer opere em qualquer fila.

**Alternativas consideradas**:
- Factory pattern com `SqsServiceFactory.create(queueUrl)`: adiciona indireção sem benefício real.
- Providers nomeados (`@Inject('SQS_PADRE_RAMON')`): seria necessário se cada fila tivesse credenciais/região diferentes. Não é o caso.

### Decision 4: Substituição de `AwsSqsService` por `SqsService` (remoção do antigo)

**Escolhido**: Remover `AwsSqsService` e prover `SqsService` com API compatível + métodos adicionais.

**Rationale**: Manter `AwsSqsService` como alias/deprecated criaria dois caminhos para a mesma funcionalidade. O `AwsSqsService` tem apenas 2 métodos (`receiveMessage`, `deleteMessage`) e 1 importador (`SqsConsumerService`). O `SqsService` cobre esses 2 métodos com mesma assinatura e adiciona `sendMessage` e `purgeQueue`.

### Decision 5: Estrutura de arquivos

```
src/aws/
├── aws.module.ts                 ← umbrella: importa e re-exporta SqsModule
├── sqs/                          ← sub-módulo SQS
│   ├── sqs.module.ts
│   ├── sqs.service.ts
│   ├── interfaces/
│   │   ├── sqs-receive-options.interface.ts
│   │   └── sqs-send-options.interface.ts
│   └── constants/
│       └── sqs.constants.ts
├── dynamodb/                     ← futuro (NÃO criar agora)
│   └── ...
└── s3/                           ← futuro (NÃO criar agora)
    └── ...
```

**Rationale**: Segue a convenção do projeto e prepara a estrutura para múltiplos produtos AWS. Cada produto vive em seu próprio sub-diretório com module, service, interfaces e constants — isolado e reutilizável.

## Risks / Trade-offs

- **[`SqsModule` não-global exige import de `AwsModule`]** → Mitigação: é o comportamento desejado. `AwsModule` é o ponto único de entrada para produtos AWS. Consumidores já importam `AwsModule` hoje.
- **[`SQSClient` único compartilhado entre todos os consumers]** → Mitigação: O `SQSClient` é thread-safe e stateless por design. O compartilhamento é o padrão recomendado pela AWS SDK.
- **[Futuro worker pode precisar de long polling]** → Mitigação: `SqsService.receiveMessage()` já aceita `waitTimeSeconds` como parâmetro. Long polling é uma questão de configuração de chamada, não de arquitetura do módulo.
- **[Remoção de `AwsSqsService` é breaking]** → Mitigação: Apenas `SqsConsumerService` importa `AwsSqsService` hoje. A migração é contida e automática.

## Migration Plan

1. Criar `src/aws/sqs/` com `SqsModule`, `SqsService`, interfaces e constants.
2. Atualizar `src/aws/aws.module.ts` para importar e re-exportar `SqsModule` (em vez de prover `AwsSqsService` diretamente).
3. Refatorar `SqsConsumerService` para injetar `SqsService` em vez de `AwsSqsService`.
4. `CronModule` não precisa mudar — continua importando `AwsModule`.
5. Remover `src/aws/aws-sqs.service.ts`.
6. Verificar build e testes.

**Rollback**: Reverter via git. A mudança é contida e atômica.

## Open Questions

Nenhuma — as decisões acima cobrem o escopo. O futuro worker SQS poderá importar `AwsModule` diretamente e injetar `SqsService`. Futuros produtos AWS seguirão o mesmo padrão de sub-módulo dentro de `src/aws/`.
