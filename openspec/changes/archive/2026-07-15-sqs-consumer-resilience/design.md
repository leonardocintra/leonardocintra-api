## Context

O `SqsConsumerService` é responsável por consumir mensagens de uma fila SQS e enviá-las para um webhook. Atualmente, o método `processSqsQueue()` é executado por um cron job e processa apenas uma mensagem por execução. O código atual para o processo ao encontrar erros, impedindo o processamento de mensagens subsequentes.

**Estado atual:**
- Cron job configurado para executar a cada 2 minutos (expressão padrão: `0 0 8-18/2 * * *`)
- Processamento single-message com tratamento de erros que interrompe o fluxo
- Possibilidade de acúmulo de mensagens durante picos de tráfego

**Restrições:**
- Manter compatibilidade com o cron job existente
- Não alterar a interface pública do serviço
- Não deletar mensagens que falharam no processamento (mantê-las na fila para retry futuro)

## Goals / Non-Goals

**Goals:**
- Processar todas as mensagens disponíveis na fila em um único ciclo de execução
- Implementar tolerância a falhas por mensagem (erros não devem afetar outras mensagens)
- Adicionar intervalo de 1 minuto entre processamento de mensagens para evitar sobrecarga
- Manter comportamento de parada quando a fila estiver vazia
- Garantir que mensagens com erro permaneçam na fila para retry futuro

**Non-Goals:**
- Alterar a frequência do cron job
- Implementar processamento paralelo de mensagens
- Modificar a estrutura da fila SQS ou dead letter queue
- Alterar o formato das mensagens ou payload do webhook

## Decisions

### 1. Loop contínuo com intervalo fixo
**Decisão:** Implementar um loop `while` que continua enquanto houver mensagens, com `await new Promise(resolve => setTimeout(resolve, 60000))` entre iterações.

**Alternativas consideradas:**
- **Processamento em batch:** Receber múltiplas mensagens de uma vez via `MaxNumberOfMessages` → Rejeitado porque pode exceder limites de memória e dificulta tratamento de erros individuais
- **Loop sem intervalo:** Processar mensagens o mais rápido possível → Rejeitado porque pode causar sobrecarga no webhook e na AWS
- **Intervalo dinâmico:** Ajustar intervalo baseado na carga → Rejeitado por complexidade desnecessária para este caso de uso

**Razão:** Intervalo fixo de 1 minuto é simples, previsível e evita sobrecarga enquanto permite processamento relativamente rápido.

### 2. Tratamento de erros por mensagem
**Decisão:** Usar try-catch isolado para cada etapa (parse, webhook) com `continue` para pular para próxima mensagem em caso de erro. Não deletar mensagens que falharam.

**Alternativas consideradas:**
- **Coleta de erros:** Acumular erros e reportar ao final → Rejeitado porque pode perder contexto de quais mensagens falharam
- **Retry imediato:** Tentar novamente a mensagem que falhou → Rejeitado porque pode causar loops infinitos se a mensagem for permanentemente inválida
- **Deleção imediata:** Deletar mensagens com falha → Rejeitado porque o usuário prefere mantê-las na fila para retry futuro

**Razão:** O `continue` permite processamento resiliente enquanto mantém simplicidade. Mensagens com falha permanecem na fila para processamento em ciclos futuros.

### 3. Condição de parada do loop
**Decisão:** Parar o loop quando `receiveMessage()` retornar `undefined` (fila vazia) ou quando ocorrer erro de comunicação com AWS.

**Alternativas consideradas:**
- **Contador de mensagens:** Parar após N mensagens processadas → Rejeitado porque pode deixar mensagens não processadas
- **Timeout:** Parar após tempo limite → Rejeitado porque pode interromper processamento incompleto
- **Processar até falha:** Continuar até primeira falha → Rejeitado porque viola requisito de tolerância a falhas

**Razão:** Parar quando a fila está vazia é o comportamento mais natural e alinhado com o ciclo do cron job.

## Risks / Trade-offs

### Risco 1: Sobrecarga do webhook
**Risco:** Processar muitas mensagens rapidamente pode sobrecarregar o endpoint do webhook.
**Mitigação:** Intervalo fixo de 1 minuto entre mensagens limita a taxa de processamento.

### Risco 2: Mensagens ficarem na fila após falha
**Risco:** Se o processo falhar no meio do loop, mensagens podem ficar na fila sem serem processadas.
**Mitigação:** O cron job será executado novamente, retomando o processamento. Mensagens não deletadas ficam disponíveis para próxima execução.

### Risco 3: Aumento do tempo de execução do cron
**Risco:** Processar múltiplas mensagens pode aumentar significativamente o tempo de execução.
**Mitigação:** Intervalo de 1 minuto garante que cada execução tenha tempo limitado. Monitorar duração das execuções.

### Risco 4: Reprocessamento de mensagens com erro
**Risco:** Mensagens que falharam permanecerão na fila e serão reprocessadas em ciclos futuros, podendo causar processamento duplicado.
**Mitigação:** Webhook deve ser idempotente para evitar efeitos colaterais. Implementar controle de idempotência se necessário.

## Migration Plan

1. **Implementação:** Alterar método `processSqsQueue()` conforme design
2. **Testes:** Verificar comportamento com mensagens válidas, inválidas e falhas de webhook
3. **Deploy:** Publicar alteração via pipeline de CI/CD existente
4. **Monitoramento:** Acompanhar logs e métricas de processamento nas primeiras horas
5. **Rollback:** Reverter para versão anterior se problemas críticos forem detectados

## Open Questions

1. **Idempotência do webhook:** O endpoint do webhook suporta recebimento duplicado da mesma mensagem? Se não, pode ser necessário implementar controle de idempotência no consumer.
2. **Limite de mensagens:** Existe um limite máximo de mensagens que devem ser processadas por ciclo? Para evitar execuções muito longas.
3. **Alertas:** Devemos configurar alertas quando houver muitas falhas consecutivas?