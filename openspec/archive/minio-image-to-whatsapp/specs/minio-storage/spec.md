## ADDED Requirements

### Requirement: MinioService recupera imagem em formato base64
O sistema SHALL possuir um `MinioService` em `src/minio/minio.service.ts` que conecta ao MinIO utilizando as variáveis de ambiente `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_ACCESS_KEY` e `MINIO_SECRET_KEY`, e expõe uma função `recuperarImagem(objectKey: string): Promise<string>` que retorna o conteúdo da imagem como uma string base64 com prefixo `data:image/jpeg;base64,` (ou `data:image/png;base64,` quando o `mimetype` retornado pelo MinIO for `image/png`). O bucket padrão SHALL ser configurado via `MINIO_BUCKET`.

#### Scenario: Recuperação bem-sucedida de imagem
- **WHEN** a função `recuperarImagem` é chamada com um `objectKey` válido presente no bucket configurado em `MINIO_BUCKET`
- **THEN** o sistema baixa o stream do objeto via `client.getObject(bucket, objectKey)`
- **AND** converte o stream para Buffer
- **AND** converte o Buffer para base64 e retorna a string no formato `data:<mimetype>;base64,<conteudo>`
- **AND** o `mimetype` é detectado a partir de `stat.metaData['content-type']` retornado pelo MinIO; quando ausente, SHALL assumir `image/jpeg`

#### Scenario: Variáveis de ambiente não configuradas
- **WHEN** o `MinioService` é instanciado e qualquer variável de ambiente obrigatória (`MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`) não está configurada
- **THEN** o serviço SHALL registrar um erro no log durante a primeira chamada a `recuperarImagem` indicando qual(is) variável(is) está(ão) faltando, e SHALL propagar a exceção lançada pelo SDK do MinIO

#### Scenario: Falha ao recuperar objeto
- **WHEN** a função `recuperarImagem` é chamada com um `objectKey` inexistente no bucket, ou o MinIO retorna erro (ex: 4xx, 5xx, network)
- **THEN** o sistema registra o erro no log incluindo o `objectKey`
- **AND** propaga a exceção para o chamador

### Requirement: MinioModule provê e exporta MinioService
O `MinioModule` SHALL ser um módulo NestJS válido que provê `MinioService` e o exporta para que outros módulos (ex: `WorkerModule`) possam injetá-lo via construtor.

#### Scenario: MinioModule importado no AppModule
- **WHEN** o `AppModule` é carregado
- **THEN** o `MinioModule` está na lista de `imports` do `AppModule`

#### Scenario: MinioService injetado no WhatsAppWorkerService
- **WHEN** o `WorkerModule` importa `MinioModule` e o `WhatsAppWorkerService` declara `MinioService` no construtor
- **THEN** a injeção de dependência é resolvida com sucesso e o `WhatsAppWorkerService` pode chamar `minioService.recuperarImagem(...)`

### Requirement: Cliente MinIO inicializado no construtor do MinioService
O `MinioService` SHALL inicializar o cliente do SDK do MinIO no construtor, utilizando as variáveis de ambiente (`MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`) e armazenar o nome do bucket (`MINIO_BUCKET`) para uso nas chamadas de `getObject`.

#### Scenario: Cliente configurado a partir do env
- **WHEN** o `MinioService` é instanciado
- **THEN** um `Client` do SDK do MinIO é criado com `useSSL` convertido para booleano a partir de `MINIO_USE_SSL` (string `'true'`/`'false'`)
- **AND** `this.bucket` é igual ao valor da variável `MINIO_BUCKET`