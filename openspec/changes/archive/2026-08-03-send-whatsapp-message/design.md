## Context

O projeto já possui um módulo WhatsApp (`src/whatsapp/`) com um `MensagemService` que apenas recebe mensagens via webhook da Evolution API e as encaminha para o SQS. O `WhatsappModule` atual importa apenas `AwsModule`. O projeto já possui `@nestjs/axios` (^4.0.1) e `axios` (^1.7.0) instalados no `package.json`, mas o `HttpModule` não está importado em nenhum módulo ainda. O `ConfigModule` já está configurado como global no `AppModule`, então `ConfigService` está disponível em todo o projeto.

A Evolution API espera requisições POST para `/message/sendText/{{instance}}` com header `apikey` e body JSON contendo `number`, `text` e `name`.

## Goals / Non-Goals

**Goals:**
- Adicionar capacidade de envio proativo de mensagens de texto no WhatsApp via Evolution API
- Usar o `HttpModule` do NestJS para fazer a requisição HTTP, mantendo consistência com o ecossistema NestJS
- Centralizar a configuração de URL, instância e API key em variáveis de ambiente

**Non-Goals:**
- Não implementa envio de mídia (imagens, áudio, documentos)
- Não cria um endpoint REST público para disparar mensagens (apenas a função no service)
- Não implementa retry/exponential backoff de envio
- Não implementa fila de envio

## Decisions

### 1. Usar HttpModule do NestJS em vez de axios direto
**Escolha**: `HttpModule` (do `@nestjs/axios`).
**Razão**: Mantém consistência com o ecossistema NestJS, permite injeção de dependência do `HttpService`, e facilita testes com `HttpService` mockado. O pacote já está instalado.

**Alternativa considerada**: Usar `axios` diretamente no service. Descartado porque o `HttpModule` já está disponível e segue o padrão NestJS de DI.

### 2. Configuração via ConfigService em vez de process.env direto
**Escolha**: Injetar `ConfigService` no `MensagemService` e ler as variáveis `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` e a instância (já existente como `EVOLUTION_INSTANCE_ID`).
**Razão**: O `ConfigModule` já está configurado como global. Usar `ConfigService` é o padrão NestJS e mais testável que `process.env` direto. No entanto, o código atual do `MensagemService` já usa `process.env` diretamente (linhas 17, 21, 25), então para consistência com o código existente, a nova função também pode usar `process.env` ou `ConfigService` — optamos por `ConfigService` para novo código.

### 3. Parâmetro `name` no body
**Escolha**: O body da requisição inclui o campo `name`. Como a função publica recebe apenas `number` e `text`, o `name` será derivado do número (usando o próprio número como placeholder) ou será um parâmetro opcional adicional. Decisão: usar o número como `name` por padrão, pois a Evolution API exige o campo mas não o valida estritamente.

**Alternativa**: Adicionar `name` como parâmetro obrigatório na função. Descartado para manter a assinatura simples conforme solicitado (apenas `number` e `text`).

### 4. Tratamento de erros
**Escolha**: A função deve propagar erros da Evolution API para o chamador, com log via `this.logger` (já disponível via `BaseService`). Não usar try/catch para suprimir erros — exceções devem subir para que o controller decida o response code.

### 5. Registro do HttpModule no WhatsappModule
**Escolha**: Importar `HttpModule` no `WhatsappModule` via `imports: [HttpModule]` (sem configuração customizada, pois a URL e headers serão passados na requisição).

## Risks / Trade-offs

- **Risco**: API key exposta em logs → **Mitigação**: Nunca logar o header de autorização; usar `this.logger.debug` apenas com o número e status da resposta.
- **Trade-off**: Sem retry policy, falhas na Evolution API resultam em erro imediato → Aceitável para MVP; retry pode ser adicionado depois.
- **Trade-off**: Sem fila de envio, mensagens são enviadas sincronamente → Aceitável porque a função é assíncrona (async) e o chamador pode aguardar ou não.
- **Risco**: Variável `EVOLUTION_API_URL` não configurada → **Mitigação**: A função deve lançar erro descritivo se a URL não estiver configurada.
