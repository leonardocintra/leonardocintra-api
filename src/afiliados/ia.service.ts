import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { EnvService } from 'src/config/env.service';
import { MelhorarMensagemDto, Tone } from './dto/melhorar-mensagem.dto';

const IA_TIMEOUT_MS = 30_000;
const IA_TEMPERATURE = 0.5;
const IA_MAX_TOKENS = 1300;

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  casual: 'casual e amigável, como um amigo recomendando para outro',
  entusiasmado: 'entusiasmado e animado, com energia, mas sem exagero',
  direto: 'direto e objetivo, sem rodeios, focado na oferta',
};

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private client: OpenAI | undefined;

  constructor(private readonly env: EnvService) { }

  async melhorarMensagem(dto: MelhorarMensagemDto): Promise<{ message: string }> {
    const tone: Tone = dto.tone ?? 'casual';
    this.logger.debug(`IA melhorar-mensagem - tone: ${tone}, entrada: ${dto.message}`);

    let improved: string | undefined;
    try {
      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: this.env.VERBOO_MODEL,
        temperature: IA_TEMPERATURE,
        max_tokens: IA_MAX_TOKENS,
        messages: [
          { role: 'system', content: this.buildSystemPrompt(tone) },
          { role: 'user', content: dto.message },
        ],
      });
      const choice = response.choices[0];

      if (!choice) {
        throw new BadGatewayException(
          'A IA não retornou uma resposta válida.',
        );
      }

      if (choice.finish_reason === 'length') {
        this.logger.warn(
          'IA atingiu o limite de tokens antes de finalizar a resposta',
        );

        throw new BadGatewayException(
          'A IA não conseguiu finalizar a mensagem. Tente novamente.',
        );
      }

      improved = choice.message?.content?.trim();
    } catch (error) {
      this.logger.error(
        'Falha ao melhorar mensagem com IA',
        error instanceof Error ? error.stack : String(error),
      );
      throw new BadGatewayException('Falha ao gerar a mensagem com IA. Tente novamente.');
    }

    if (!improved) {
      this.logger.error('IA retornou resposta vazia');
      throw new BadGatewayException('Falha ao gerar a mensagem com IA. Tente novamente.');
    }

    this.logger.debug(`IA saída: ${improved}`);
    return { message: improved };
  }

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = this.env.VERBOO_API_KEY;
      if (!apiKey) {
        this.logger.error('VERBOO_API_KEY não configurada');
        throw new Error('VERBOO_API_KEY não configurada');
      }
      this.client = new OpenAI({
        apiKey,
        baseURL: this.env.VERBOO_API_BASE_URL,
        timeout: IA_TIMEOUT_MS,
        maxRetries: 0,
      });
    }
    return this.client;
  }

  private buildSystemPrompt(tone: Tone): string {
    return [
      'Você é um especialista em copywriting para ofertas de produtos em grupos de WhatsApp e Telegram.',
      '',
      'Sua tarefa é melhorar uma mensagem de oferta para torná-la mais atraente, persuasiva e agradável de ler, aumentando a chance de clique e conversão.',
      '',
      'A mensagem recebida pode conter diferentes partes, como:',
      '- título ou chamada principal;',
      '- descrição do produto;',
      '- preço;',
      '- desconto;',
      '- cupom;',
      '- informações de frete;',
      '- nome da loja ou marketplace;',
      '- links;',
      '- chamadas para ação;',
      '- outras informações importantes.',
      '',
      'REGRA PRINCIPAL:',
      'Melhore principalmente o título ou chamada principal da oferta.',
      'Não reescreva desnecessariamente as outras partes da mensagem.',
      'Se as outras partes já estiverem adequadas, preserve-as praticamente como estão.',
      '',
      'REGRAS OBRIGATÓRIAS:',
      '- Nunca invente informações que não estejam na mensagem original.',
      '- Nunca altere preços.',
      '- Nunca altere cupons.',
      '- Nunca altere nomes de lojas ou marketplaces.',
      '- Nunca altere links.',
      '- Nunca invente descontos.',
      '- Nunca invente benefícios.',
      '- Nunca invente características do produto.',
      '- Nunca invente condições de compra.',
      '- Nunca adicione informações que não estejam na mensagem original.',
      '- Preserve códigos de cupom exatamente como recebidos.',
      '- Preserve links exatamente como recebidos.',
      '- Preserve informações de frete exatamente como recebidas.',
      '',
      'TÍTULO / CHAMADA PRINCIPAL:',
      '- Identifique a primeira chamada ou título principal da oferta.',
      '- Melhore essa chamada para deixá-la mais atraente e natural.',
      '- Pode corrigir gramática, pontuação e exageros de escrita.',
      '- Pode usar emojis para aumentar o destaque.',
      '- Pode usar linguagem mais próxima de uma recomendação entre pessoas.',
      '- Não transforme o título em uma frase exageradamente publicitária.',
      '- Não invente benefícios.',
      '- Se o título já estiver bom, faça apenas pequenas melhorias.',
      '',
      'PREÇOS:',
      '- Se houver preço anterior e preço atual, mantenha ambos.',
      '- Quando houver preço anterior e preço atual, coloque-os em uma linha própria.',
      '- Use o formato: 💰 DE R$ XX,XX → POR R$ XX,XX 🔥',
      '- Se houver somente um preço, preserve somente esse preço.',
      '- Nunca invente um preço anterior.',
      '',
      'ESTRUTURA:',
      '- Preserve as quebras de linha da mensagem original sempre que possível.',
      '- Não transforme a mensagem inteira em um único parágrafo.',
      '- Preserve emojis existentes quando eles fizerem parte das informações ou da identidade da mensagem.',
      '- Não remova chamadas para ação existentes.',
      '- Não remova links.',
      '- Não remova informações sobre cupons.',
      '- Não remova informações sobre frete.',
      '',
      'FORMATAÇÃO:',
      '- Preserve a formatação Markdown do WhatsApp, especialmente *negrito*.',
      '- Preserve emojis existentes.',
      '- Você pode adicionar emojis de forma moderada quando isso melhorar o destaque.',
      '',
      'ESTILO:',
      '- Curto.',
      '- Direto.',
      '- Natural.',
      '- Persuasivo.',
      '- Conversacional.',
      '- Adequado para WhatsApp e Telegram.',
      '- Português do Brasil.',
      `- TOM: ${TONE_DESCRIPTIONS[tone]}.`,
      '',
      'SAÍDA:',
      '- Retorne somente a mensagem final.',
      '- Não explique o que foi alterado.',
      '- Não apresente alternativas.',
      '- Não inclua análise.',
      '- Não inclua aspas envolvendo a mensagem.',
    ].join('\n');
  }
}
