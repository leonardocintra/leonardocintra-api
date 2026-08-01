## Why

O endpoint `POST /whatsapp/mensagem/receber` recebe webhooks da Evolution API (WhatsApp) mas atualmente não possui um DTO para validar o payload. Sem tipagem e validação, qualquer payload malformado é aceito silenciosamente, permitindo erros em runtime e dificultando o tratamento correto das mensagens recebidas. O JSON de referência está em `src/whatsapp/docs/payload-mensagem.json`.

## What Changes

- Criar classes DTO aninhadas em `src/whatsapp/dto/receber-mensagem.dto.ts` baseadas no payload real documentado em `src/whatsapp/docs/payload-mensagem.json`
- Tipar e validar todos os campos do envelope: `headers` (chave-valor dinâmico), `params` (vazio), `query` (vazio), `body` (estrutura completa do evento)
- Validar campos aninhados: `body.data.key` (chave da mensagem), `body.data.message` (conteúdo), e campos de metadados (`event`, `instance`, `destination`, `sender`, `server_url`, `apikey`, etc.)
- Usar `class-validator` decoradores seguindo o padrão existente do projeto (como `src/padre-ramon/dtos/create-registro-visita.dto.ts`)
- Permitir campos opcionais que podem ser nulos (ex: `contextInfo: null`) com `@IsOptional()`

## Capabilities

### New Capabilities
- `receber-mensagem`: DTO e validação para o payload de webhook de recebimento de mensagens WhatsApp da Evolution API

### Modified Capabilities
<!-- Nenhuma capability existente tem requisitos alterados -->

## Impact

- **Arquivos afetados**: `src/whatsapp/dto/receber-mensagem.dto.ts` (atualmente vazio)
- **Dependências**: `class-validator` (já instalada no projeto)
- **APIs**: O endpoint `POST /whatsapp/mensagem/receber` poderá usar o DTO como `@Body()` no controller
- **Sem breaking changes**: O arquivo DTO está vazio e o controller não ainda usa tipagem de body
