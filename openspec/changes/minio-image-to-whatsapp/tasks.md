## 1. Dependências

- [ ] 1.1 Verificar se o pacote `minio` já está em `dependencies` em `package.json`. Se ausente, instalar: `npm install minio`. Em paralelo (independente), instalar os tipos: `npm install --save-dev @types/minio`.
- [ ] 1.2 Confirmar que `package.json` lista `minio` em `dependencies` e `@types/minio` em `devDependencies`. Rodar `npm install` para atualizar `package-lock.json`.

## 2. MinioService

- [ ] 2.1 Criar `src/minio/minio.service.ts` com `@Injectable()`, injetando `ConfigService` no construtor. Estender `BaseService` (de `src/commons/BaseService`) para obter `this.logger` — seguir o padrão dos demais services.
- [ ] 2.2 No construtor do `MinioService`, inicializar o cliente do SDK: `new Client({ endPoint, port, useSSL: useSSL === 'true', accessKey, secretKey })`, lendo `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` via `ConfigService.get<string>()`. Armazenar também `this.bucket = this.configService.get<string>('MINIO_BUCKET')`.
- [ ] 2.3 Implementar `async recuperarImagem(objectKey: string): Promise<string>`: chamar `client.getObject(this.bucket, objectKey)`, coletar o stream em `Buffer` (`streamToBuffer`), obter `stat.metaData['content-type']` via callback/promise, montar `data:<mimetype>;base64,<buffer.toString('base64')>`. Default `mimetype` = `image/jpeg`. Tratar erros com `this.logger.error` e propagar.
- [ ] 2.4 Atualizar `src/minio/minio.module.ts` para ser um módulo NestJS válido: adicionar `providers: [MinioService]` e `exports: [MinioService]`, mantendo `imports: []`.

## 3. Integração no AppModule

- [ ] 3.1 Em `src/app.module.ts`, adicionar `MinioModule` à lista de `imports` (junto aos outros módulos da aplicação). Verificar se já há referência e apenas adicionar se faltar.

## 4. Integração no WorkerModule

- [ ] 4.1 Em `src/worker/worker.module.ts`, adicionar `MinioModule` à lista de `imports`.
- [ ] 4.2 Em `src/worker/whatsapp-worker.service.ts`, importar `MinioService` e adicioná-lo ao construtor como parâmetro `private readonly minioService: MinioService`.

## 5. Lógica de recuperação e envio

- [ ] 5.1 Em `processAfiliadosIdQueue` (`src/worker/whatsapp-worker.service.ts`, próximo à linha 116-122), após o fetch bem-sucedido de `mensagemExterna`, calcular `let imageBase64: string | undefined = undefined`. Se `mensagemExterna.imageUrl` for truthy, chamar `imageBase64 = await this.minioService.recuperarImagem(mensagemExterna.imageUrl)`. Em caso de exceção na recuperação, registrar log com `this.logger.error` e **não** prosseguir (a mensagem SQS permanece na fila para retentativa).
- [ ] 5.2 Substituir a chamada `await this.mensagemService.enviarMensagem(mensagemExterna.message);` por `await this.mensagemService.enviarMensagem(mensagemExterna.message, imageBase64);`. Manter o `TODO: alterar a imagem com logo da marca` como comentário (não remover, está fora do escopo).
- [ ] 5.3 Garantir que o fluxo de erro (`catch (error)` já existente) continua envolvendo tanto a recuperação da imagem quanto o envio — não alterar a estrutura do try/catch existente; apenas garantir que `imageBase64` seja resolvido antes do envio.

## 6. Validação

- [ ] 6.1 Rodar `npm run build` (ou `npx tsc --noEmit`) e garantir zero erros TypeScript.
- [ ] 6.2 Rodar `npm run lint` (se houver script configurado) e garantir zero novos warnings/errors.
- [ ] 6.3 Subir a aplicação localmente (`npm run start:dev`) e validar logs: o `MinioService` deve inicializar sem erros de config ausente (ou com log explícito se faltar env). Acessar `GET /afiliados/mensagem-externa/:id` para confirmar que a API continua funcionando.
- [ ] 6.4 (Opcional/manual) Disparar uma mensagem de teste com `imageUrl` setado no banco e validar via logs que a imagem é recuperada e enviada para a Evolution API. Confirmar que a mensagem é marcada como `online` via `AfiliadosService.atualizarMensagemExternaById`.
- [ ] 6.5 Validar mensagens sem `imageUrl`: confirmar que o fluxo continua funcionando apenas com texto (sem chamada ao MinIO).

## 7. Revisão final

- [ ] 7.1 Verificar que **nenhum arquivo `.env` foi modificado ou visualizado** durante a implementação (restrição do solicitante).
- [ ] 7.2 Revisar diff final com `git diff` antes de pedir review/commit: confirmar mudanças em `src/minio/`, `src/worker/`, `src/app.module.ts` e `package.json`/`package-lock.json`. Nada além disso.