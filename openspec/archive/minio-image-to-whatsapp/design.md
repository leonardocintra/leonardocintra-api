## Context

Hoje, o `WhatsAppWorkerService` (em `src/worker/whatsapp-worker.service.ts`) processa mensagens da fila SQS de IDs de afiliados, busca a `mensagemExterna` no banco via Prisma (`AfiliadosService.buscarMensagemExternaById`), e chama `MensagemService.enviarMensagem(mensagemExterna.message)` — **apenas com o texto**. A `MensagemService.enviarMensagem` já aceita um parâmetro opcional `imageUrl?: string` e usa o endpoint da Evolution API `/message/sendMedia/{instance}`, mas o worker nunca aproveita isso porque a imagem não é recuperada do MinIO.

A coluna `imageUrl` já existe na model Prisma `afiliadosMensagemExterna` (`prisma/schema.prisma:295`), e o módulo `MinioModule` existe em `src/minio/minio.module.ts`, mas está vazio (sem providers/exports). As variáveis de ambiente do MinIO já estão em `.env.sample` (`MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`).

Restrições do solicitante:
- Instalar `@types/minio` como devDependency (SDK `minio` provavelmente já está em `dependencies`, ou precisa ser adicionado).
- **Não** mexer nem visualizar `.env`.

## Goals / Non-Goals

**Goals:**
- Criar `MinioService` que conecta ao MinIO e expõe `recuperarImagem(objectKey): Promise<string>` retornando base64 com prefixo `data:<mimetype>;base64,`.
- Tornar `MinioModule` um módulo NestJS exportando `MinioService`.
- Integrar o `MinioService` no `WhatsAppWorkerService`: quando `mensagemExterna.imageUrl` estiver presente, recuperar a imagem e passá-la para `enviarMensagem(text, imageBase64)`.
- Preservar o comportamento atual (texto-only) quando `imageUrl` for nulo/vazio.

**Non-Goals:**
- Upload de imagens para o MinIO (fluxo inverso — não faz parte desta mudança).
- Deleção de imagens antigas do MinIO (existe um `TODO` em `AfiliadosService.deleteMensagensAntigas` mas está fora do escopo).
- Alterações no schema Prisma (coluna `imageUrl` já existe).
- Mudanças em `.env` ou `.env.sample` (a coluna `imageUrl` no `.env.sample` referente ao MinIO já está completa).
- Substituir o `mimetype` fixo `image/jpeg` na `MensagemService` (será revisitado em mudança futura se necessário).

## Decisions

### Decision 1: SDK `minio` (oficial) + `@types/minio` em devDependencies
- **Por quê**: É o SDK oficial Node.js para MinIO/S3, mantido pela MinIO Inc., com tipos via DefinitelyTyped. Já temos `@types/minio` para instalar; o pacote `minio` em si deve estar em `dependencies` (verificar via `package.json` — se não estiver, adicionar; a spec instrucional do usuário disse apenas instalar `@types/minio`, mas sem `minio` em runtime isso quebraria — será tratado como pré-requisito da tarefa 1).
- **Alternativa considerada**: `aws-sdk` (S3-compatível) — descartada por ser overkill; MinIO SDK é mais leve e idiomático.

### Decision 2: Retornar base64 `data:<mimetype>;base64,...` em vez de URL pública
- **Por quê**: A Evolution API (`/message/sendMedia/`) aceita `media` tanto como URL quanto como base64 com prefixo `data:...`. Retornar base64 elimina dependência de o MinIO expor endpoint público e mantém a imagem "embarcada" na requisição — mais simples e portável. O `MensagemService` simplesmente repassa a string no campo `media`.
- **Alternativa considerada**: Gerar URL pré-assinada via `presignedGetObject` e enviar essa URL. Descartada porque exige que o MinIO seja alcançável a partir da Evolution API (que pode estar em outra rede/VPC) e adiciona dependência de tempo de expiração.

### Decision 3: `objectKey` é o valor de `mensagemExterna.imageUrl` (path completo dentro do bucket)
- **Por quê**: O campo `imageUrl` da tabela armazena a chave do objeto (path dentro do bucket `MINIO_BUCKET`), não uma URL HTTP. Isso é consistente com o `TODO` em `deleteMensagensAntigas` ("apagar a imagem do Minio também, se existir"), que trata o valor como chave de objeto.
- **Alternativa considerada**: Parsear URL HTTP → extrair path. Descartada por complexidade desnecessária se o contrato atual já for `objectKey`.

### Decision 4: `MinioModule` permanece em `src/minio/` (não mover)
- **Por quê**: Já existe um diretório `src/minio/minio.module.ts` e o usuário instruiu "Já temos o módulo minio criado". Vamos apenas preenchê-lo, sem mover/refatorar.

### Decision 5: `MensagemService.enviarMensagem(text, imageUrl?)` — sem nova assinatura
- **Por quê**: A função já possui o parâmetro opcional `imageUrl?: string` e o body com `media: imageUrl` já está preparado. Não precisamos alterar a assinatura — basta o worker passar o segundo argumento quando aplicável. Isso minimiza o blast radius.
- **Verificação**: `src/whatsapp/mensagem/mensagem.service.ts:63` — `async enviarMensagem(text: string, imageUrl?: string): Promise<any>` já suporta.

### Decision 6: Não instalar `@nestjs/config` adicional nem chamar `ConfigService` extra
- **Por quê**: O `MinioService` já pode injetar `ConfigService` (já usado em `MensagemService`) — basta ler as variáveis de ambiente por ele.

## Risks / Trade-offs

- **[Risco] Memória alta para imagens grandes**: Converter o stream do MinIO em Buffer e depois em base64 dobra o consumo de memória em runtime. → **Mitigação**: o campo `imageUrl` é `VarChar(500)` no Prisma, então o `objectKey` é curto e presume-se que as imagens armazenadas são pequenas (logos de marca / thumbnails). Para um produto final com imagens maiores, considerar streaming direto para o `HttpService.post` da Evolution API — fora do escopo desta mudança.
- **[Risco] Falha no download do MinIO bloqueia o envio da mensagem**: Se o MinIO estiver offline e `mensagemExterna.imageUrl` estiver setado, a mensagem será retentada até o visibility timeout da SQS expirar. → **Mitigação**: o worker NÃO deleta a mensagem em caso de erro (consistente com o comportamento atual de `enviarMensagem`), e o log permite diagnóstico operacional.
- **[Risco] `mimetype` inconsistente**: O `MensagemService.enviarMensagem` envia `mimetype: 'image/jpeg'` fixo, mas o conteúdo pode ser PNG. → **Mitigação fora do escopo**: documentado em `Non-Goals`; a Evolution API normalmente infere do conteúdo base64. Será revisitado em mudança futura se houver relatos de problemas.
- **[Trade-off] Dupla serialização JSON**: O body enviado para a Evolution API é `JSON.stringify`'ado pelo `HttpService.post`; se o base64 for muito grande (>5MB), o body JSON cresce e pode estourar limites de payload HTTP. → **Mitigação**: para imagens de produto típicas (<1MB) isso não é problema.

## Migration Plan

1. **Fase 1 — Instalação** (sem downtime):
   - `npm install --save-dev @types/minio`
   - Verificar/instalar `minio` em `dependencies` se ainda não estiver.

2. **Fase 2 — Deploy** (rolling, sem impacto):
   - Adicionar `MinioService` em `src/minio/minio.service.ts` e atualizar `src/minio/minio.module.ts` para prover/exportar o serviço.
   - Adicionar `MinioModule` aos `imports` do `AppModule` e do `WorkerModule`.
   - Injetar `MinioService` no `WhatsAppWorkerService`.
   - Modificar o bloco em `processAfiliadosIdQueue` para chamar `minioService.recuperarImagem()` quando `imageUrl` existir e passar o resultado como segundo argumento de `enviarMensagem`.

3. **Rollback**:
   - Reverter os commits das alterações em `src/minio/`, `src/worker/`, `src/app.module.ts` e `package.json`.
   - Como não há migração de schema nem mudança em contrato HTTP externo, rollback é trivial.

## Open Questions

- O pacote `minio` (sem o `@types/`) já está em `package.json`? O usuário instruiu instalar apenas `@types/minio`. → **Ação**: incluir uma sub-tarefa no `tasks.md` para verificar e instalar o pacote `minio` em `dependencies` se ausente.
- O `MINIO_BUCKET` é configurado por ambiente (`mensagem-imagens` em dev) ou dinâmico? → **Decisão**: usar o valor da env var como constante na inicialização (single-tenant por enquanto). Se houver multi-bucket, refatorar para receber `bucket` como parâmetro — fora do escopo.