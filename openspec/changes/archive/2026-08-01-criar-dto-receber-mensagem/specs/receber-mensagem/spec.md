## ADDED Requirements

### Requirement: DTO raiz ReceberMensagemDto deve validar o envelope completo do webhook
O sistema SHALL fornecer uma classe `ReceberMensagemDto` que valide o envelope externo do payload do webhook, incluindo `headers`, `params`, `query`, `body`, `webhookUrl`, e `executionMode`.

#### Scenario: Payload completo e válido
- **WHEN** um payload contendo `headers` (Record de strings), `params` (objeto), `query` (objeto), `body` (objeto), `webhookUrl` (string), e `executionMode` (string) é recebido
- **THEN** a validação passa sem erros

#### Scenario: Payload sem webhookUrl
- **WHEN** um payload sem o campo `webhookUrl` é recebido
- **THEN** a validação falha indicando que `webhookUrl` é obrigatório

### Requirement: BodyDto deve validar os metadados do evento
O sistema SHALL fornecer uma classe `BodyDto` que valide os campos `event`, `instance`, `data`, `destination`, `date_time`, `sender`, `server_url`, e `apikey` dentro de `body`.

#### Scenario: Body com todos os metadados
- **WHEN** `body` contém `event` (string), `instance` (string), `data` (objeto), `destination` (string), `date_time` (string), `sender` (string), `server_url` (string), e `apikey` (string)
- **THEN** a validação passa sem erros

#### Scenario: Body sem campo event
- **WHEN** `body` não contém o campo `event`
- **THEN** a validação falha indicando que `event` é obrigatório

### Requirement: DataDto deve validar os dados da mensagem
O sistema SHALL fornecer uma classe `DataDto` que valide os campos `key` (objeto aninhado), `pushName` (string), `status` (string), `message` (objeto aninhado), `contextInfo` (nullable), `messageType` (string), `messageTimestamp` (number), `instanceId` (string), e `source` (string).

#### Scenario: Data com contextInfo nulo
- **WHEN** `data.contextInfo` é `null`
- **THEN** a validação passa sem erros, pois `contextInfo` é opcional e aceita null

#### Scenario: Data com messageType conversation
- **WHEN** `data.messageType` é `"conversation"` e `data.message` contém o campo `conversation` (string)
- **THEN** a validação passa sem erros

### Requirement: KeyDto deve validar a chave da mensagem
O sistema SHALL fornecer uma classe `KeyDto` que valide os campos `remoteJid` (string), `fromMe` (boolean), `id` (string), `participant` (string), `participantAlt` (string opcional), e `addressingMode` (string).

#### Scenario: Key completa de mensagem de grupo
- **WHEN** `key` contém `remoteJid` (sufixo @g.us), `fromMe: false`, `id`, `participant`, `participantAlt`, e `addressingMode: "lid"`
- **THEN** a validação passa sem erros

#### Scenario: Key sem participantAlt
- **WHEN** `key` não contém o campo `participantAlt`
- **THEN** a validação passa sem erros, pois `participantAlt` é opcional

### Requirement: MessageDto deve validar o conteúdo da mensagem de forma flexível
O sistema SHALL fornecer uma classe `MessageDto` que valide o objeto `message` considerando que diferentes tipos de mensagem têm campos diferentes. Os campos `conversation`, `senderKeyDistributionMessage`, e `messageContextInfo` SHALL ser opcionais.

#### Scenario: Mensagem do tipo conversation
- **WHEN** `message` contém `conversation` (string), `senderKeyDistributionMessage` (objeto), e `messageContextInfo` (objeto)
- **THEN** a validação passa sem erros

#### Scenario: Mensagem sem campos de criptografia
- **WHEN** `message` contém apenas `conversation` (string) sem `senderKeyDistributionMessage` ou `messageContextInfo`
- **THEN** a validação passa sem erros, pois esses campos são opcionais

### Requirement: Todos os DTOs devem usar class-validator seguindo o padrão do projeto
O sistema SHALL usar decoradores `class-validator` (`@IsString()`, `@IsNumber()`, `@IsBoolean()`, `@IsOptional()`, `@IsObject()`, `@ValidateNested()`, `@Type()`) seguindo o mesmo padrão usado em `src/padre-ramon/dtos/create-registro-visita.dto.ts` e `src/blog/dto/create-post.dto.ts`.

#### Scenario: DTO importado e usado no controller
- **WHEN** o arquivo `src/whatsapp/dto/receber-mensagem.dto.ts` é importado
- **THEN** todas as classes (`ReceberMensagemDto`, `BodyDto`, `DataDto`, `KeyDto`, `MessageDto`) estão exportadas e utilizam decoradores class-validator com `@Type()` do `class-transformer` para validação aninhada
