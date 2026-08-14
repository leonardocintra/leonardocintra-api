## MODIFIED Requirements

### Requirement: WhatsAppWorkerService consome mensagens das filas SQS
O sistema SHALL possuir um `WhatsAppWorkerService` em `src/worker/whatsapp-worker.service.ts` que implementa `OnApplicationBootstrap` e faz polling contínuo de duas filas SQS: uma de mensagens (`AVISEI_PRECO_BOM_MENSAGENS_SQS_QUEUE_NAME`) e outra de IDs de afiliados (`AVISEI_PRECO_BOM_AFILIADOS_ID_SQS_QUEUE_NAME`), ambas sob `AWS_SQS_BASE_URL`.

#### Scenario: Polling iniciado no bootstrap da aplicação
- **WHEN** a aplicação NestJS inicializa
- **THEN** o `WhatsAppWorkerService` inicia dois intervals de polling que chamam `SqsService.receiveMessage(queueUrl)` repetidamente
- **AND** ambos usam long polling com `WaitTimeSeconds: 20` para reduzir requests vazios

#### Scenario: Queue URL não configurada
- **WHEN** a variável de ambiente `AWS_SQS_BASE_URL` ou qualquer nome de fila não está configurada
- **THEN** o worker loga um warning e não inicia o polling da respectiva fila
- **AND** a aplicação continua funcionando normalmente

### Requirement: Worker processa fila de IDs de afiliados e envia mensagem externa para WhatsApp
Para cada mensagem recebida da fila de afiliados (com payload `{ id: number }`), o worker SHALL buscar a mensagem externa correspondente via `AfiliadosService.buscarMensagemExternaById(id)`, recuperar a imagem do MinIO quando `mensagemExterna.imageUrl` estiver presente, e chamar `MensagemService.enviarMensagem(mensagemExterna.message, imageBase64?)`. Em caso de sucesso, SHALL atualizar o status da mensagem externa para `AVISEI_PRECO_BOM_STATUS_ONLINE` via `AfiliadosService.atualizarMensagemExternaById(id, { status })` e excluir a mensagem da fila SQS.

#### Scenario: Mensagem externa processada com sucesso (com imagem)
- **WHEN** uma mensagem é recebida da fila SQS de afiliados com `{ id }` válido, e a mensagem externa retornada possui `imageUrl` não vazio
- **THEN** o worker chama `MinioService.recuperarImagem(imageUrl)` para obter a imagem em base64
- **AND** o worker chama `MensagemService.enviarMensagem(mensagemExterna.message, imageBase64)` passando o texto e a imagem em base64
- **AND** após o retorno bem-sucedido, o worker chama `AfiliadosService.atualizarMensagemExternaById(id, { status: 'online' })` e exclui a mensagem da fila via `SqsService.deleteMessage(queueUrl, receiptHandle)`

#### Scenario: Mensagem externa processada com sucesso (sem imagem)
- **WHEN** uma mensagem é recebida da fila SQS de afiliados com `{ id }` válido, e a mensagem externa retornada possui `imageUrl` nulo ou vazio
- **THEN** o worker chama `MensagemService.enviarMensagem(mensagemExterna.message)` passando apenas o texto
- **AND** após o retorno bem-sucedido, o worker chama `AfiliadosService.atualizarMensagemExternaById(id, { status: 'online' })` e exclui a mensagem da fila

#### Scenario: Mensagem externa não encontrada
- **WHEN** uma mensagem é recebida da fila SQS de afiliados com `{ id }` válido, mas `buscarMensagemExternaById` retorna `null`
- **THEN** o worker loga um warning indicando que a mensagem externa não foi encontrada
- **AND** o worker exclui a mensagem da fila para evitar reprocessamento infinito

#### Scenario: Falha ao chamar enviarMensagem
- **WHEN** o `MensagemService.enviarMensagem` lança uma exceção
- **THEN** o worker loga o erro
- **AND** o worker NÃO atualiza o status da mensagem externa nem exclui a mensagem da fila, permitindo que o SQS reentregue a mensagem após o visibility timeout

#### Scenario: Falha ao recuperar imagem do MinIO
- **WHEN** o `MinioService.recuperarImagem` lança uma exceção
- **THEN** o worker loga o erro
- **AND** o worker NÃO chama `enviarMensagem` para essa mensagem
- **AND** o worker NÃO exclui a mensagem da fila, permitindo reprocessamento

### Requirement: Worker extrai o texto de ReceberMensagemDto e chama enviarMensagem
Para cada mensagem recebida da fila SQS de mensagens, o worker SHALL desserializar o body como `ReceberMensagemDto`, extrair o texto de `data.message.conversation`, e salvar a mensagem via `AfiliadosService.salvarMensagemExterna('WhatsApp', text)`.

#### Scenario: Mensagem da fila de mensagens processada com sucesso
- **WHEN** uma mensagem é recebida da fila SQS com body contendo `data.message.conversation` (string não vazia)
- **THEN** o worker chama `AfiliadosService.salvarMensagemExterna('WhatsApp', text)` onde `text` é o valor de `data.message.conversation`
- **AND** após o retorno bem-sucedido de `salvarMensagemExterna`, o worker exclui a mensagem da fila via `SqsService.deleteMessage(queueUrl, receiptHandle)`

#### Scenario: Mensagem sem campo conversation
- **WHEN** uma mensagem é recebida da fila SQS de mensagens mas `data.message.conversation` é undefined ou vazia
- **THEN** o worker loga um warning com o `messageType` da mensagem
- **AND** o worker exclui a mensagem da fila para evitar reprocessamento infinito

### Requirement: Worker exclui mensagem da fila apenas após processamento bem-sucedido
O worker SHALL excluir a mensagem da fila SQS via `SqsService.deleteMessage` somente após o processamento bem-sucedido. Em qualquer cenário de erro durante o processamento, a mensagem NÃO deve ser excluída.

#### Scenario: Delete após sucesso
- **WHEN** o processamento (envio para WhatsApp ou salvamento da mensagem) retorna sem erro
- **THEN** o worker chama `SqsService.deleteMessage(queueUrl, message.ReceiptHandle)`

#### Scenario: Não delete em caso de erro
- **WHEN** qualquer etapa do processamento falha (desserialização, busca no banco, recuperação da imagem, envio)
- **THEN** o worker NÃO chama `SqsService.deleteMessage`
- **AND** a mensagem permanece visível na fila após o visibility timeout para nova tentativa

### Requirement: WorkerModule em src/worker/ com importações necessárias
O sistema SHALL possuir um `WorkerModule` em `src/worker/worker.module.ts` que importa `AwsModule` (para `SqsService`), `WhatsappModule` (para `MensagemService`), `AfiliadosModule` (para `AfiliadosService`) e `MinioModule` (para `MinioService`), e provê `WhatsAppWorkerService` e `CronWorkerService`.

#### Scenario: WorkerModule importado no AppModule
- **WHEN** o `AppModule` é carregado
- **THEN** o `WorkerModule` está na lista de `imports` do `AppModule`
- **AND** o `WhatsAppWorkerService` é instanciado e seu hook `OnApplicationBootstrap` é disparado

#### Scenario: Dependências injetadas
- **WHEN** o `WhatsAppWorkerService` é instanciado
- **THEN** o `SqsService` está injetável via `AwsModule`
- **AND** o `MensagemService` está injetável via `WhatsappModule`
- **AND** o `AfiliadosService` está injetável via `AfiliadosModule`
- **AND** o `MinioService` está injetável via `MinioModule`