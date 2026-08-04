## Why

O sistema atual apenas recebe mensagens do WhatsApp via webhook da Evolution API, mas não consegue enviar mensagens proativamente. Precisamos de uma funcionalidade que permita disparar mensagens de texto para números específicos através da Evolution API, habilitando respostas automáticas, notificações e fluxos de comunicação bidirecional.

## What Changes

- Adicionar função `enviarMensagem` no `MensagemService` que envia mensagem de texto via Evolution API
- Configurar `HttpModule` do NestJS no `WhatsappModule` para fazer requisições HTTP à Evolution API
- Adicionar variáveis de ambiente `EVOLUTION_API_URL` e `EVOLUTION_API_KEY` no `.env`
- A função recebe `number` (número do destinatário) e `text` (conteúdo da mensagem), e envia um POST para `https://evolution.leonardocintra.com.br/message/sendText/{{instance}}` com header `apikey` e body contendo `number`, `text` e `name`

## Capabilities

### New Capabilities
- `whatsapp-send-message`: Permite o envio proativo de mensagens de texto no WhatsApp através da Evolution API, com configuração de URL, instância e API key via variáveis de ambiente.

### Modified Capabilities

(nenhuma — a funcionalidade existente de recebimento de mensagens não sofre alteração de comportamento)

## Impact

- **Código afetado**: `src/whatsapp/mensagem/mensagem.service.ts` (nova função), `src/whatsapp/whatsapp.module.ts` (import do HttpModule)
- **Configuração**: `.env` precisa das novas variáveis `EVOLUTION_API_URL` e `EVOLUTION_API_KEY`
- **Dependências**: `@nestjs/axios` e `axios` (já presentes no projeto? se não, precisam ser instaladas)
- **API externa**: Evolution API em `https://evolution.leonardocintra.com.br`
- **Sem breaking changes** — apenas adição de nova funcionalidade
