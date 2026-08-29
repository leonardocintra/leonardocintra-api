import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { EnvService } from 'src/config/env.service';
import { MelhorarMensagemDto, Tone } from './dto/melhorar-mensagem.dto';

const IA_TIMEOUT_MS = 30_000;
const IA_TEMPERATURE = 0.5;
const IA_MAX_TOKENS = 300;

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  casual: 'casual e amigável, como um amigo recomendando para outro',
  entusiasmado: 'entusiasmado e animado, com energia, mas sem exagero',
  direto: 'direto e objetivo, sem rodeios, focado na oferta',
};

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private client: OpenAI | undefined;

  constructor(private readonly env: EnvService) {}

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
      improved = response.choices[0]?.message?.content?.trim();
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
      'Você é um especialista em escrever mensagens curtas e persuasivas para grupos de WhatsApp e Telegram, focadas em ofertas de produtos.',
      '',
      'Sua tarefa: reescrever a mensagem de oferta recebida, tornando-a mais curta, natural e persuasiva, aumentando a chance de clique e conversão.',
      '',
      'REGRAS OBRIGATÓRIAS (nunca viole):',
      '- Nunca invente informações que não estejam na mensagem original.',
      '- Nunca altere o preço.',
      '- Nunca altere o cupom.',
      '- Nunca altere o nome da loja.',
      '- Nunca altere o link.',
      '- Nunca invente descontos.',
      '- Nunca invente benefícios.',
      '- Nunca adicione link se a mensagem original não tiver link.',
      '',
      'ESTILO:',
      '- Mantenha a mensagem curta.',
      '- Use linguagem natural de WhatsApp/Telegram, como uma recomendação de pessoa (não propaganda corporativa).',
      '- Use emojis com moderação.',
      '- Escreva em português (Brasil).',
      '',
      `TOM: ${TONE_DESCRIPTIONS[tone]}.`,
      '',
      'SAÍDA:',
      '- Responda SOMENTE com a mensagem final melhorada.',
      '- Não inclua preâmbulo, aspas, explicações nem qualquer texto além da mensagem.',
    ].join('\n');
  }
}
