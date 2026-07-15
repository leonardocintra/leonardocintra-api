## ADDED Requirements

### Requirement: Processamento contínuo de mensagens SQS
O sistema SHALL processar todas as mensagens disponíveis na fila SQS em um único ciclo de execução, continuando o processamento mesmo quando ocorrem erros em mensagens individuais.

#### Scenario: Fila com múltiplas mensagens
- **WHEN** a fila SQS contém N mensagens disponíveis
- **THEN** o sistema processa todas as N mensagens sequencialmente, uma após a outra

#### Scenario: Erro no processamento de mensagem
- **WHEN** ocorre erro ao processar uma mensagem (parse, webhook ou delete)
- **THEN** o sistema registra o erro e continua processando a próxima mensagem

#### Scenario: Fila vazia
- **WHEN** a fila SQS não contém mensagens disponíveis
- **THEN** o sistema interrompe o processamento e aguarda o próximo ciclo do cron job

### Requirement: Intervalo entre processamento de mensagens
O sistema SHALL aguardar 1 minuto entre o processamento de cada mensagem para evitar sobrecarga no webhook e na AWS.

#### Scenario: Processamento sequencial com intervalo
- **WHEN** o sistema processa uma mensagem com sucesso
- **THEN** aguarda 1 minuto antes de processar a próxima mensagem

#### Scenario: Intervalo após falha
- **WHEN** ocorre falha no processamento de uma mensagem
- **THEN** aguarda 1 minuto antes de tentar processar a próxima mensagem

### Requirement: Tratamento resiliente de erros
O sistema SHALL tratar erros de forma isolada por mensagem, permitindo que o processamento continue mesmo com falhas.

#### Scenario: Erro de parse JSON
- **WHEN** o payload da mensagem não é um JSON válido
- **THEN** o sistema registra o erro e continua com a próxima mensagem sem deletar a mensagem atual

#### Scenario: Falha no webhook
- **WHEN** ocorre erro ao notificar o webhook
- **THEN** o sistema registra o erro e continua com a próxima mensagem sem deletar a mensagem atual

#### Scenario: Falha na deleção
- **WHEN** ocorre erro ao deletar mensagem da fila após envio bem-sucedido do webhook
- **THEN** o sistema registra o erro e continua com a próxima mensagem

### Requirement: Retenção de mensagens com erro
O sistema SHALL não deletar mensagens da fila SQS quando ocorrer erro no processamento, permitindo que sejam reprocessadas em ciclos futuros.

#### Scenario: Erro no parse de JSON
- **WHEN** ocorre erro ao parsear o body da mensagem como JSON válido
- **THEN** o sistema não deleta a mensagem da fila, apenas registra o erro e continua com a próxima mensagem

#### Scenario: Falha no envio para webhook
- **WHEN** ocorre erro ao notificar o webhook com o payload
- **THEN** o sistema não deleta a mensagem da fila, apenas registra o erro e continua com a próxima mensagem

#### Scenario: Falha na deleção de mensagem
- **WHEN** ocorre erro ao deletar mensagem da fila após processamento bem-sucedido
- **THEN** o sistema não tenta deletar novamente, apenas registra o erro e continua com a próxima mensagem

#### Scenario: Erro de comunicação com AWS SQS
- **WHEN** ocorre erro ao comunicar com o serviço SQS da AWS (receiveMessage ou deleteMessage)
- **THEN** o sistema não deleta nenhuma mensagem, apenas registra o erro e interrompe o loop

### Requirement: Parada do loop quando fila vazia
O sistema SHALL interromper o loop de processamento quando a fila SQS estiver vazia.

#### Scenario: Mensagem não encontrada
- **WHEN** receiveMessage() retorna undefined (fila vazia)
- **THEN** o sistema interrompe o loop e aguarda próximo ciclo do cron job

#### Scenario: Erro de comunicação com AWS
- **WHEN** ocorre erro ao comunicar com o serviço SQS da AWS
- **THEN** o sistema registra o erro e interrompe o loop