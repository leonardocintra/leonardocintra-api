## ADDED Requirements

### Requirement: Enviar mensagem de texto via Evolution API
O sistema SHALL permitir o envio de mensagens de texto no WhatsApp através de uma função no `MensagemService` que faz uma requisição POST para a Evolution API.

#### Scenario: Envio bem-sucedido de mensagem
- **WHEN** a função `enviarMensagem` é chamada com um número de telefone válido e um texto
- **THEN** o sistema envia uma requisição POST para `https://evolution.leonardocintra.com.br/message/sendText/{{instance}}` onde `instance` é o valor da variável de ambiente `EVOLUTION_INSTANCE_ID`, com header `apikey` contendo o valor da variável de ambiente `EVOLUTION_API_KEY`, e body JSON contendo os campos `number` (o número informado), `text` (o texto informado) e `name` (o número como valor padrão)
- **AND** o sistema retorna a resposta da Evolution API

#### Scenario: Variáveis de ambiente não configuradas
- **WHEN** a função `enviarMensagem` é chamada e a variável de ambiente `EVOLUTION_API_KEY` ou `EVOLUTION_API_URL` não está configurada
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
O `MensagemService` SHALL expor uma função `enviarMensagem` que recebe os parâmetros `number` (string) e `text` (string) e faz a requisição HTTP para a Evolution API.

#### Scenario: Assinatura da função
- **WHEN** a função `enviarMensagem` é definida no `MensagemService`
- **THEN** ela aceita dois parâmetros obrigatórios: `number: string` e `text: string`
- **AND** ela retorna uma Promise que resolve com a resposta da Evolution API
