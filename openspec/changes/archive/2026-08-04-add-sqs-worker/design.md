## Context

O `MensagemService.receberMensagem` já envia mensagens WhatsApp recebidas para a fila SQS (`AVISEI_PRECO_BOM_SQS_QUEUE_URL`). O projeto já possui um padrão de consumer SQS em `src/cron/sqs-consumer/sqs-consumer.service.ts` que faz polling via cron e processa mensagens com delete após sucesso. O novo worker segue o mesmo padrão de polling, mas é disparado no bootstrap da aplicação (`OnApplicationBootstrap`) em vez de cron, e chama `MensagemService.enviarMensagem` em vez de um webhook HTTP.

## Goals / Non-Goals

**Goals:**
- Consumir mensagens da fila SQS `AVISEI_PRECO_BOM_SQS_QUEUE_URL` automaticamente na inicialização da aplicação
- Desserializar cada mensagem como `ReceberMensagemDto` e extrair o texto de `data.message.conversation`
- Chamar `enviarMensagem(text)` para reencaminhar a mensagem ao WhatsApp
- Excluir a mensagem da fila após processamento bem-sucedido
- Seguir o padrão de código e injeção de dependência já estabelecido em `SqsConsumerService`

**Non-Goals:**
- Não alterar `receberMensagem` ou `enviarMensagem` existentes no `MensagemService`
- Não implementar dead-letter queue ou retry com backoff exponencial (a mensagem permanece na fila se falhar, e SQS cuida do retry nativo via visibility timeout)
- Não substituir o `SqsConsumerService` existente — é outro consumer para outra fila
- Não adicionar testes automatizados nesta fase

## Decisions

### Decision 1: Worker como service NestJS com `OnApplicationBootstrap` em vez de cron

**Rationale**: O `SqsConsumerService` usa cron porque o webhook do Padre Ramon é síncrono e precisa de janela específica. O worker de WhatsApp não tem restrição de horário — ele deve processar continuamente. Usar `OnApplicationBootstrap` com loop de polling + `WaitTimeSeconds` (long polling SQS) é mais simples e mais responsivo que cron.

**Alternativa considerada**: Reutilizar o padrão cron do `SqsConsumerService`. Rejeitado porque adiciona latência desnecessária entre chegada da mensagem e processamento.

### Decision 2: Polling contínuo com `setInterval` em vez de loop `while(true)`

**Rationale**: Um `setInterval` é mais previsível e evita bloquear o event loop. O `SqsConsumerService` usa `while(hasMessages)` com `setTimeout` entre mensagens, mas para um worker contínuo, `setInterval` com uma chamada `receiveMessage` por tick (usando long polling com `WaitTimeSeconds`) é mais limpo.

**Alternativa considerada**: `while(true)` com `await`. Funciona mas pode starving o event loop se não houver pausa.

### Decision 3: Desserializar como `ReceberMensagemDto` via `JSON.parse` (sem validação class-validator)

**Rationale**: A mensagem foi enviada por `receberMensagem` que já validou o payload antes de enfileirar. Revalidar com class-validator no consumer adicionaria overhead desnecessário. Usar `JSON.parse` e acessar `data.message.conversation` é suficiente.

**Alternativa considerada**: Usar `plainToInstance` do class-transformer para validação completa. Rejeitado por overhead desnecessário.

### Decision 4: Extrair texto de `data.message.conversation` apenas

**Rationale**: O user especificou que o campo de texto é `data.message.conversation`. Se a mensagem não tiver esse campo (ex: mensagem de mídia), o worker deve logar warning e pular a mensagem (e deletá-la da fila para não reprocessar indefinidamente).

### Decision 5: Novo `WorkerModule` separado em `src/worker/`

**Rationale**: Isola o código do worker em seu próprio módulo. O `WorkerModule` importa `AwsModule` (para `SqsService`) e `WhatsappModule` (para `MensagemService`), e é importado no `AppModule`.

## Risks / Trade-offs

- **[Polling contínuo consome uma connection SQS constante]** → Mitigação: usar long polling (`WaitTimeSeconds: 20`) para que o SQS segure a conexão até 20s sem custo adicional, reduzindo requests vazios
- **[Mensagem sem `conversation` é descartada]** → Mitigação: logar warning com o `messageType` para diagnóstico, e deletar a mensagem para evitar reprocessamento infinito
- **[Se `enviarMensagem` falhar, a mensagem permanece na fila]** → Comportamento desejado: o SQS retry nativo reentregará a mensagem após o visibility timeout expirar
- **[Sem shutdown gracioso]** → O `setInterval` pode disparar após a aplicação estar em shutdown. Mitigação: usar `OnApplicationShutdown` para limpar o interval (não crítico — SQS lida com mensagens não confirmadas)
