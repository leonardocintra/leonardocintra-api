## ADDED Requirements

### Requirement: WhatsAppWorkerService consome mensagens da fila SQS
O sistema SHALL possuir um `WhatsAppWorkerService` em `src/worker/whatsapp-worker.service.ts` que implementa `OnApplicationBootstrap` e faz polling contínuo da fila SQS configurada pela variável de ambiente `AVISEI_PRECO_BOM_SQS_QUEUE_URL`.

#### Scenario: Polling iniciado no bootstrap da aplicação
- **WHEN** a aplicação NestJS inicializa
- **THEN** o `WhatsAppWorkerService` inicia um interval de polling que chama `SqsService.receiveMessage(queueUrl)` repetidamente
- **AND** usa long polling com `WaitTimeSeconds: 20` para reduzir requests vazios

#### Scenario: Queue URL não configurada
- **WHEN** a variável de ambiente `AVISEI_PRECO_BOM_SQS_QUEUE_URL` não está configurada
- **THEN** o worker loga um warning e não inicia o polling
- **AND** a aplicação continua funcionando normalmente

### Requirement: Worker extrai o texto da mensagem e chama enviarMensagem
Para cada mensagem recebida da fila SQS, o worker SHALL desserializar o body como `ReceberMensagemDto`, extrair o texto de `data.message.conversation` e chamar `MensagemService.enviarMensagem(text)`.

#### Scenario: Mensagem processada com sucesso
- **WHEN** uma mensagem é recebida da fila SQS com body contendo `data.message.conversation` (string não vazia)
- **THEN** o worker chama `MensagemService.enviarMensagem(text)` onde `text` é o valor de `data.message.conversation`
- **AND** após o retorno bem-sucedido de `enviarMensagem`, o worker exclui a mensagem da fila via `SqsService.deleteMessage(queueUrl, receiptHandle)`

#### Scenario: Mensagem sem campo conversation
- **WHEN** uma mensagem é recebida da fila SQS mas `data.message.conversation` é undefined ou vazia
- **THEN** o worker loga um warning com o `messageType` da mensagem
- **AND** o worker exclui a mensagem da fila para evitar reprocessamento infinito

#### Scenario: Falha ao chamar enviarMensagem
- **WHEN** o `MensagemService.enviarMensagem` lança uma exceção
- **THEN** o worker loga o erro
- **AND** o worker NÃO exclui a mensagem da fila, permitindo que o SQS reentregue a mensagem após o visibility timeout

### Requirement: Worker exclui mensagem da fila apenas após processamento bem-sucedido
O worker SHALL excluir a mensagem da fila SQS via `SqsService.deleteMessage` somente após o processamento e envio bem-sucedidos. Em qualquer cenário de erro durante o processamento, a mensagem NÃO deve ser excluída.

#### Scenario: Delete após sucesso
- **WHEN** `enviarMensagem` retorna sem erro
- **THEN** o worker chama `SqsService.deleteMessage(queueUrl, message.ReceiptHandle)`

#### Scenario: Não delete em caso de erro
- **WHEN** qualquer etapa do processamento falha (desserialização ou envio)
- **THEN** o worker NÃO chama `SqsService.deleteMessage`
- **AND** a mensagem permanece visível na fila após o visibility timeout para nova tentativa

### Requirement: WorkerModule em src/worker/ com importações necessárias
O sistema SHALL possuir um `WorkerModule` em `src/worker/worker.module.ts` que importa `AwsModule` (para `SqsService`) e `WhatsappModule` (para `MensagemService`), e exporta `WhatsAppWorkerService`.

#### Scenario: WorkerModule importado no AppModule
- **WHEN** o `AppModule` é carregado
- **THEN** o `WorkerModule` está na lista de `imports` do `AppModule`
- **AND** o `WhatsAppWorkerService` é instanciado e seu hook `OnApplicationBootstrap` é disparado

#### Scenario: Dependências injetadas
- **WHEN** o `WhatsAppWorkerService` é instanciado
- **THEN** o `SqsService` está injetável via `AwsModule`
- **AND** o `MensagemService` está injetável via `WhatsappModule`
