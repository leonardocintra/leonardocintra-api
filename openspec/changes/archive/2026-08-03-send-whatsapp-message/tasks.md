## 1. Configuração de Variáveis de Ambiente

- [x] 1.1 Adicionar `EVOLUTION_API_URL=https://evolution.leonardocintra.com.br` e `EVOLUTION_API_KEY=<valor>` no `.env.sample`
- [x] 1.2 Adicionar `EVOLUTION_API_URL` e `EVOLUTION_API_KEY` no `.env.sample` (com valor placeholder, sem a key real)

## 2. Configuração do HttpModule no WhatsappModule

- [x] 2.1 Importar `HttpModule` de `@nestjs/axios` no `src/whatsapp/whatsapp.module.ts`
- [x] 2.2 Adicionar `HttpModule` no array `imports` do `@Module` decorator do `WhatsappModule`

## 3. Implementação da Função enviarMensagem no MensagemService

- [x] 3.1 Adicionar import do `HttpService` de `@nestjs/axios` e `ConfigService` de `@nestjs/config` no `src/whatsapp/mensagem/mensagem.service.ts`
- [x] 3.2 Injetar `HttpService` e `ConfigService` no construtor do `MensagemService` (mantendo os injetores existentes `prismaService` e `sqsService`)
- [x] 3.3 Criar a função `enviarMensagem(number: string, text: string)` no `MensagemService` que:
  - Lê `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` e `EVOLUTION_INSTANCE_ID` do `ConfigService`/`process.env`
  - Valida que as variáveis estão configuradas (lança erro descritivo se faltar)
  - Monta a URL: `${EVOLUTION_API_URL}/message/sendText/${instance}`
  - Monta o header: `{ apikey: EVOLUTION_API_KEY }`
  - Monta o body: `{ number, text, name: number }`
  - Faz a requisição POST via `this.httpService.post(url, body, { headers })`
  - Retorna a resposta da Evolution API
  - Erros são logados via `this.logger.error` e propagados (não suprimidos)

## 4. Verificação e Validação

- [x] 4.1 Rodar `npm run build` (ou `npx tsc --noEmit`) e garantir sem erros de compilação
- [x] 4.2 Rodar `biome check` em `src/whatsapp/mensagem/mensagem.service.ts` e `src/whatsapp/whatsapp.module.ts` e garantir sem erros de lint
