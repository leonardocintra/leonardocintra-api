## 1. Preparação do módulo

- [x] 1.1 Adicionar `exports: [MensagemService]` ao `WhatsappModule` em `src/whatsapp/whatsapp.module.ts` para que o `WorkerModule` possa injetar o `MensagemService`
- [x] 1.2 Adicionar `imports: [AwsModule, WhatsappModule]` e `providers: [WhatsAppWorkerService]` ao `WorkerModule` em `src/worker/worker.module.ts` (módulo já existe como stub vazio e já está importado no `AppModule`)

## 2. Implementação do WhatsAppWorkerService

- [x] 2.1 Criar `src/worker/whatsapp-worker.service.ts` com classe `WhatsAppWorkerService` que implementa `OnApplicationBootstrap`, injetando `ConfigService`, `SqsService` e `MensagemService` no construtor
- [x] 2.2 Implementar `onApplicationBootstrap()`: ler `AVISEI_PRECO_BOM_SQS_QUEUE_URL` do `ConfigService`; se não configurada, logar warning e retornar; se configurada, iniciar `setInterval` que chama o método de polling
- [x] 2.3 Implementar o método de polling: chamar `sqsService.receiveMessage(queueUrl, { waitTimeSeconds: 20 })` para long polling; se não houver mensagem, retornar; se houver, desserializar o body com `JSON.parse` como `ReceberMensagemDto`
- [x] 2.4 Extrair o texto de `data.message.conversation` do payload desserializado; se for vazio/undefined, logar warning com o `messageType` e chamar `sqsService.deleteMessage` para remover a mensagem inválida da fila
- [x] 2.5 Chamar `mensagemService.enviarMensagem(text)` com o texto extraído; após sucesso, chamar `sqsService.deleteMessage(queueUrl, message.ReceiptHandle)` para eliminar a mensagem da fila
- [x] 2.6 Em caso de erro no `enviarMensagem`, logar o erro e NÃO deletar a mensagem (permanece na fila para retry do SQS); em caso de erro no `receiveMessage`, logar e continuar o polling

## 3. Verificação

- [x] 3.1 Rodar `npx tsc --noEmit` para confirmar que não há erros de tipo
- [x] 3.2 Rodar `npm run build` para confirmar que o projeto compila
