## Why

As mensagens recebidas via webhook do WhatsApp são enfileiradas no SQS pelo `MensagemService.receberMensagem`, mas não existem consumidores processando essa fila. É necessário um worker que escute a fila SQS, extraia o texto da mensagem e chame `enviarMensagem` para reencaminhar a mensagem para um grupo de WhatsApp, completando o fluxo de ponta a ponta.

## What Changes

- Criar um novo módulo `WorkerModule` em `src/worker/` com um service `WhatsAppWorkerService` que implementa `OnApplicationBootstrap`
- O worker faz polling da fila SQS configurada pela variável `AVISEI_PRECO_BOM_SQS_QUEUE_URL` usando `SqsService.receiveMessage`
- Para cada mensagem recebida, o worker desserializa o body como `ReceberMensagemDto`, extrai o texto de `data.message.conversation` e chama `MensagemService.enviarMensagem(text)`
- Após processar a mensagem com sucesso, o worker exclui a mensagem da fila via `SqsService.deleteMessage`
- Em caso de falha no processamento, a mensagem permanece na fila para nova tentativa
- Não alterar a função `receberMensagem` já existente no `MensagemService`

## Capabilities

### New Capabilities
- `whatsapp-sqs-worker`: Worker que consome mensagens da fila SQS e reenvia o texto para o WhatsApp via `enviarMensagem`

### Modified Capabilities
<!-- Nenhuma capability existente tem requisito alterado. O worker apenas reutiliza SqsService e MensagemService existentes. -->

## Impact

- **Novo código**: `src/worker/` — `worker.module.ts`, `whatsapp-worker.service.ts`
- **Módulos existentes reutilizados**: `AwsModule` (para `SqsService`), `WhatsappModule` (para `MensagemService`)
- **Registro do worker**: `WorkerModule` deve ser importado no `AppModule`
- **Variáveis de ambiente**: reutiliza `AVISEI_PRECO_BOM_SQS_QUEUE_URL` já configurada por `MensagemService.receberMensagem`
- **Sem breaking changes**: não altera `receberMensagem`, `enviarMensagem` ou qualquer endpoint existente
