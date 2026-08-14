## MODIFIED Requirements

### Requirement: Enviar mensagem com texto e imagem via Evolution API
O sistema SHALL permitir o envio de mensagens de WhatsApp contendo texto e imagem opcional através de uma função no `MensagemService` que faz uma requisição POST para a Evolution API no endpoint `/message/sendMedia/{instance}` (onde `instance` é o valor da variável de ambiente `EVOLUTION_INSTANCE_JULIANA_ID`), com header `apikey` contendo `EVOLUTION_API_KEY`, e body JSON contendo `number` (obtido de `EVOLUTION_WHATSAPP_NUMBER`), `mediatype: 'image'`, `mimetype: 'image/jpeg'`, `media` (imagem em formato base64 `data:image/jpeg;base64,...` quando fornecida), `caption` (o texto informado) e `fileName: 'imagem.jpg'`.

#### Scenario: Envio bem-sucedido com imagem
- **WHEN** a função `enviarMensagem` é chamada com um texto e uma string base64 de imagem válida (segundo argumento `imageUrl`)
- **THEN** o sistema envia uma requisição POST para `${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE_JULIANA_ID}` com o body contendo `media` igual à string base64 e `caption` igual ao texto informado
- **AND** o sistema retorna a resposta da Evolution API

#### Scenario: Envio bem-sucedido sem imagem (apenas texto)
- **WHEN** a função `enviarMensagem` é chamada com apenas um argumento `text` (sem `imageUrl`)
- **THEN** o sistema envia uma requisição POST para `${EVOLUTION_API_URL}/message/sendMedia/${EVOLUTION_INSTANCE_JULIANA_ID}` com `media` igual a `undefined` (ou omitido) e `caption` igual ao texto informado
- **AND** o sistema retorna a resposta da Evolution API

#### Scenario: Variáveis de ambiente não configuradas
- **WHEN** a função `enviarMensagem` é chamada e a variável de ambiente `EVOLUTION_API_KEY`, `EVOLUTION_API_URL` ou `EVOLUTION_INSTANCE_JULIANA_ID` não está configurada
- **THEN** o sistema lança um erro descritivo indicando qual variável está faltando

#### Scenario: Falha na requisição para a Evolution API
- **WHEN** a função `enviarMensagem` é chamada e a Evolution API retorna um erro (ex: 4xx, 5xx)
- **THEN** o sistema registra o erro no log e propaga a exceção para o chamador

### Requirement: Configuração do HttpModule no WhatsappModule
O `WhatsappModule` SHALL importar o `HttpModule` do `@nestjs/axios` para disponibilizar o `HttpService` injetável no `MensagemService`.

#### Scenario: HttpModule disponível no MensagemService
- **WHEN** o `WhatsappModule` é carregado pela aplicação NestJS
- **THEN** o `HttpService` está injetável no `MensagemService` via injeção de dependência do construtor

### Requirement: Função enviarMensagem no MensagemService
O `MensagemService` SHALL expor uma função `enviarMensagem` que recebe os parâmetros `text: string` (obrigatório) e `imageUrl?: string` (opcional) e faz a requisição HTTP para a Evolution API no endpoint `/message/sendMedia/{instance}`.

#### Scenario: Assinatura da função
- **WHEN** a função `enviarMensagem` é definida no `MensagemService`
- **THEN** ela aceita um parâmetro obrigatório `text: string` e um parâmetro opcional `imageUrl?: string`
- **AND** ela retorna uma Promise que resolve com a resposta da Evolution API