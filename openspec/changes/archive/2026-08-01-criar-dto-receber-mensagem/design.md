## Context

O módulo `whatsapp` possui o endpoint `POST /whatsapp/mensagem/receber` no controller `src/whatsapp/mensagem/mensagem.controller.ts`. Atualmente o método `receberMensagem()` não recebe nenhum parâmetro tipado. A Evolution API envia webhooks com um payload complexo e aninhado, documentado em `src/whatsapp/docs/payload-mensagem.json`. O projeto já usa `class-validator` para validação de DTOs (ex: `src/padre-ramon/dtos/create-registro-visita.dto.ts` e `src/blog/dto/create-post.dto.ts`).

O arquivo de destino `src/whatsapp/dto/receber-mensagem.dto.ts` existe mas está vazio.

## Goals / Non-Goals

**Goals:**
- Modelar o payload completo do webhook da Evolution API como classes TypeScript com decoradores `class-validator`
- Criar classes aninhadas para cada nível do JSON: `ReceberMensagemDto` (raiz), `BodyDto` (corpo), `DataDto` (dados), `KeyDto` (chave), `MessageDto` (mensagem)
- Validar campos obrigatórios com tipagem adequada (string, number, boolean, nullable)
- Manter campos dinâmicos/opcionais (`headers` como Record, `contextInfo` como nullable, arrays de bytes como `Record<string, number>`)

**Non-Goals:**
- Integrar o DTO no controller (isso será feito em uma change separada)
- Implementar lógica de processamento da mensagem
- Validar semântica do conteúdo da mensagem (ex: verificar se URL é válida)

## Decisions

### 1. Classes aninhadas em arquivo único
**Escolha**: Todas as classes DTO em `src/whatsapp/dto/receber-mensagem.dto.ts`.
**Alternativa considerada**: Arquivos separados por classe (ex: `body.dto.ts`, `data.dto.ts`).
**Rationale**: O payload é um único envelope. Manter em um arquivo facilita a visão geral da estrutura e segue a simplicidade do DTOs existentes no projeto que são single-file.

### 2. Uso de `@IsOptional()` para campos nullable
**Escolha**: Campos que podem ser `null` no JSON (ex: `contextInfo`) usam `@IsOptional()` + `@ValidateNested()`.
**Rationale**: `class-validator` com `@IsOptional()` permite `null`/`undefined` sem falhar validação.

### 3. Campos de arrays de bytes como `Record<string, number>`
**Escolha**: `messageSecret`, `axolotlSenderKeyDistributionMessage`, `threadId` modelados como `Record<string, number>` ou `number[]`.
**Rationale**: Estes são dados binários de criptografia da Evolution API. O conteúdo exato é opaco para nossa API e só precisa ser preservado, não validado em profundidade.

### 4. `headers`, `params`, `query` como `Record<string, string>`
**Escolha**: `headers` aceita chaves dinâmicas via `Record<string, string>`. `params` e `query` são objetos vazios no payload mas também aceitam `Record<string, any>`.
**Rationale**: Headers HTTP variam por request e não há benefício em validá-los individualmente neste contexto.

### 5. Não usar `@ValidateNested()` em campos opacos
**Escolha**: Para campos como `senderKeyDistributionMessage` e `messageContextInfo`, usar `@IsObject()` em vez de `@ValidateNested()`.
**Rationale**: Esses objetos contêm dados de criptografia que não precisam de validação de campos individuais. Usar `@IsObject()` garante que é um objeto sem impor validação profunda.

## Risks / Trade-offs

- **[Payload pode variar entre versões da Evolution API]** → Usar `@IsOptional()` generosamente em campos que podem ausentar em diferentes tipos de mensagem. Para campos opacos, usar validação mínima.
- **[Performance de validação aninhada profunda]** → Trade-off aceitável: a validação ocorre uma vez por request e o payload não é grande o suficiente para causar problema.
- **[Campo `conversation` vs outros tipos de mensagem]** → O payload mostra `messageType: "conversation"` mas outros tipos (image, audio, video) teriam campos diferentes em `message`. Modelar `message` com campos opcionais para suportar múltiplos tipos no futuro.
