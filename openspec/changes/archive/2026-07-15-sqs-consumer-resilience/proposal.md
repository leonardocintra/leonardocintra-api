## Why

O consumer SQS atual processa apenas uma mensagem por execução do cron job, o que pode levar a um acúmulo de mensagens na fila quando há muitas. Além disso, o processo para completamente ao encontrar uma mensagem inválida ou ao falhar ao notificar o webhook, impedindo o processamento de mensagens subsequentes. Isso resulta em processamento ineficiente e potencial perda de dados quando mensagens válidas ficam bloqueadas atrás de mensagens problemáticas.

## What Changes

- Alterar o loop de processamento para continuar consumindo mensagens enquanto a fila tiver conteúdo
- Adicionar intervalo de 1 minuto entre cada iteração do loop para evitar sobrecarga
- Implementar tratamento de erros resiliente que permite continuar processamento mesmo com falhas em mensagens individuais
- Manter comportamento de parada quando a fila estiver vazia, aguardando próximo ciclo do cron job
- Garantir que mensagens com erro permaneçam na fila para retry futuro (não deletar em caso de falha)

## Capabilities

### New Capabilities
- `sqs-resilient-consumption`: Processamento resiliente de mensagens SQS com loop contínuo e tratamento de erros por mensagem

### Modified Capabilities

## Impact

- **Código afetado**: `src/cron/sqs-consumer/sqs-consumer.service.ts` - método `processSqsQueue()`
- **Comportamento**: Mudança de processamento single-message para batch processing com tolerância a falhas
- **Performance**: Redução do acúmulo de mensagens na fila durante picos de tráfego
- **Confiabilidade**: Melhoria na disponibilidade do processamento mesmo com erros intermitentes
- **Dependências**: Nenhuma nova dependência necessária