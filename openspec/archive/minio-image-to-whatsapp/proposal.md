## Why

O worker de WhatsApp atualmente envia apenas texto para o WhatsApp. Quando uma mensagem externa possui uma imagem armazenada no MinIO (campo `imageUrl`), a imagem não é recuperada nem enviada. Precisamos buscar essa imagem no MinIO e enviá-la junto com o texto via Evolution API, que já suporta envio de mídia (`/message/sendMedia/`).

## What Changes

- Criar um `MinioService` em `src/minio/minio.service.ts` que conecta ao MinIO e recupera objetos por chave/URL.
- Tornar `MinioModule` um módulo NestJS válido, exportando `MinioService`.
- Importar `MinioModule` no `WorkerModule` para que `WhatsAppWorkerService` possa injetar `MinioService`.
- Em `processAfiliadosIdQueue` do `whatsapp-worker.service.ts`, quando `mensagemExterna.imageUrl` estiver presente, chamar o `MinioService` para recuperar a imagem.
- Passar a imagem recuperada (URL ou base64) como parâmetro `imageUrl` para `mensagemService.enviarMensagem()`, que já possui suporte a `imageUrl?` no endpoint `/message/sendMedia/`.
- Instalar `@types/minio` como dependência de desenvolvimento.
- Quando `imageUrl` estiver vazia, manter o comportamento atual (envio apenas de texto).

## Capabilities

### New Capabilities
- `minio-storage`: Serviço de recuperação de objetos (imagens) armazenados no MinIO, fornecendo operações de leitura por bucket e chave.

### Modified Capabilities
- `whatsapp-sqs-worker`: O worker de afiliados agora recupera imagens do MinIO e as envia junto com o texto para o WhatsApp, não apenas texto puro.
- `whatsapp-send-message`: O envio de mensagem para WhatsApp agora pode incluir imagem recuperada do MinIO, não apenas texto.

## Impact

- **Código afetado**: `src/minio/minio.module.ts`, novo `src/minio/minio.service.ts`, `src/worker/whatsapp-worker.service.ts`, `src/worker/worker.module.ts`
- **Dependências**: Adicionar `@types/minio` em `devDependencies`; validar se o SDK `minio` já está instalado ou se precisa ser adicionado em `dependencies`
- **Configuração**: As variáveis de ambiente do MinIO já existem em `.env.sample` (restrição: não mexer/visualizar o `.env`)
- **Sem mudanças no schema Prisma**: O campo `imageUrl` já existe na model `afiliadosMensagemExterna`
- **Sem breaking changes**: O comportamento atual (texto-only) é preservado quando `imageUrl` é nulo
