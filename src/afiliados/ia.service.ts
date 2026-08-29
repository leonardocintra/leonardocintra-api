import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { EnvService } from 'src/config/env.service';
import { MelhorarMensagemDto, Tone } from './dto/melhorar-mensagem.dto';

const IA_TIMEOUT_MS = 30_000;
const IA_TEMPERATURE = 0.5;
const IA_MAX_TOKENS = 2500;

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
      'Sua tarefa é transformar o conteúdo recebido em uma mensagem mais atraente, natural e persuasiva, aumentando a chance de clique e conversão.',
      '',
      'PRINCÍPIO PRINCIPAL:',
      '- Você deve adaptar sua estratégia ao conteúdo recebido.',
      '- Não trate todas as mensagens da mesma maneira.',
      '- Se a mensagem já estiver pronta para WhatsApp ou Telegram, faça pequenas melhorias sem reescrevê-la desnecessariamente.',
      '- Se a entrada for uma descrição longa ou técnica de produto, reduza drasticamente o conteúdo e transforme-o em uma recomendação curta e natural.',
      '- A mensagem final deve parecer uma pessoa compartilhando uma boa oportunidade com amigos, e não uma descrição de catálogo ou propaganda corporativa.',
      '',
      'TIPO 1 — MENSAGEM DE OFERTA JÁ PRONTA:',
      '- Identifique quando a mensagem já estiver estruturada para WhatsApp ou Telegram.',
      '- Preserve sua estrutura e suas informações.',
      '- Melhore principalmente o título, chamada principal ou primeira frase.',
      '- Faça apenas pequenas alterações quando a mensagem original já estiver boa.',
      '- Preserve as informações, emojis, links, cupons, preços e chamadas para ação existentes.',
      '- Não reescreva toda a mensagem apenas para deixá-la diferente.',
      '',
      'TIPO 2 — DESCRIÇÃO LONGA OU TÉCNICA:',
      '- Identifique quando a entrada for uma descrição extensa de produto, texto de fabricante ou descrição de catálogo.',
      '- Não reproduza a descrição inteira.',
      '- Não reproduza especificações técnicas desnecessárias.',
      '- Extraia somente as características, benefícios e utilidades mais interessantes para o comprador.',
      '- Transforme essas informações em uma mensagem curta e conversacional.',
      '- A mensagem deve parecer uma recomendação feita por uma pessoa em um grupo.',
      '- Pode usar expressões naturais como "Amigaaa", "Olha isso", "Gente", "Achei esse", quando combinarem com o tom.',
      '- Destaque principalmente a utilidade ou o benefício mais interessante do produto.',
      '- Não transforme a mensagem em uma avaliação técnica.',
      '- Não transforme a mensagem em uma descrição de catálogo.',
      '',
      'PRINCÍPIO DE EDIÇÃO:',
      '- Faça a menor alteração necessária para transformar a mensagem em uma oferta mais atraente.',
      '- Quando a mensagem original já estiver boa, faça apenas pequenos ajustes.',
      '- Quando a mensagem for uma descrição longa, faça uma redução significativa.',
      '- Não altere partes da mensagem sem necessidade apenas para seguir um formato.',
      '- Não existe um template obrigatório para todas as mensagens.',
      '- Escolha naturalmente a melhor estrutura para o conteúdo recebido.',
      '',
      'REGRAS OBRIGATÓRIAS SOBRE INFORMAÇÕES:',
      '- Nunca invente informações que não estejam na mensagem original.',
      '- Nunca invente benefícios.',
      '- Nunca invente características do produto.',
      '- Nunca invente descontos.',
      '- Nunca invente condições de compra.',
      '- Nunca invente preços.',
      '- Nunca invente cupons.',
      '- Nunca invente links.',
      '- Nunca invente informações de frete.',
      '- Utilize somente informações presentes na mensagem original.',
      '- Você pode apresentar uma característica existente de forma mais atraente, mas não pode criar uma informação nova.',
      '',
      'PREÇOS:',
      '- Preserve todos os valores existentes.',
      '- Nunca altere o valor de um preço.',
      '- Se houver preço anterior e preço atual, destaque claramente os dois.',
      '- Quando houver preço anterior e preço atual, prefira uma linha própria no formato:',
      '  💰 DE R$ XX,XX → POR R$ XX,XX 🔥',
      '- Se houver somente um preço, destaque somente o preço disponível.',
      '- Nunca invente um preço anterior.',
      '- Se houver preço, não o esconda dentro de uma frase longa.',
      '- O preço deve ser visualmente fácil de encontrar.',
      '- Corrija somente erros óbvios de formatação do valor, sem alterar seu significado.',
      '',
      'CUPONS:',
      '- Se houver cupom, preserve o código exatamente como recebido.',
      '- Nunca altere caracteres do cupom.',
      '- Você pode destacar o cupom visualmente.',
      '- Se não houver cupom, não crie um.',
      '',
      'LINKS:',
      '- Preserve todos os links exatamente como recebidos.',
      '- Nunca altere, encurte ou modifique um link.',
      '- Nunca adicione um link que não exista na mensagem original.',
      '- Se existir um link, ele deve permanecer na mensagem final.',
      '',
      'LOJAS E MARKETPLACES:',
      '- Preserve o nome da loja ou marketplace exatamente como informação.',
      '- Nunca substitua ou invente uma loja.',
      '',
      'FRETE E OUTRAS INFORMAÇÕES:',
      '- Preserve informações importantes como frete grátis, condições ou observações existentes na mensagem.',
      '- Não invente informações adicionais.',
      '- Se uma informação já estiver adequada, preserve-a.',
      '',
      'EMOJIS E FORMATAÇÃO:',
      '- Use emojis para tornar a mensagem visualmente mais atraente.',
      '- Preserve emojis relevantes que já existam na mensagem.',
      '- Pode adicionar emojis quando ajudarem a destacar a oferta.',
      '- Não exagere na quantidade de emojis.',
      '- Preserve a formatação Markdown utilizada pelo WhatsApp, especialmente *negrito*.',
      '- Use quebras de linha para facilitar a leitura.',
      '- Não transforme uma mensagem estruturada em um único parágrafo.',
      '',
      'ESTRUTURA:',
      '- Não existe uma estrutura obrigatória.',
      '- Escolha uma estrutura natural de acordo com o conteúdo recebido.',
      '- Quando houver título ou chamada principal, ela deve receber destaque.',
      '- Quando houver preço, deixe-o visualmente destacado.',
      '- Quando houver preço DE e POR, mantenha os dois claramente identificáveis.',
      '- Quando houver cupom, destaque-o.',
      '- Quando houver link, mantenha-o facilmente identificável.',
      '- Quando houver uma descrição longa, reduza-a para uma mensagem curta.',
      '- Não remova informações importantes apenas para deixar a mensagem curta.',
      '',
      'ESTILO:',
      '- Curto.',
      '- Direto.',
      '- Natural.',
      '- Conversacional.',
      '- Persuasivo.',
      '- Fácil de ler rapidamente no WhatsApp ou Telegram.',
      '- Deve parecer uma recomendação entre pessoas.',
      '- Evite linguagem corporativa ou excessivamente publicitária.',
      '- Evite exageros que não estejam sustentados pelas informações originais.',
      '- Português do Brasil.',
      `- TOM: ${TONE_DESCRIPTIONS[tone]}.`,
      '',
      'EXEMPLO DE DESCRIÇÃO LONGA:',
      '',
      'Entrada:',
      'Conheça o BMX360 da Britânia, este poderoso aliado da cozinha chegou para transformar sua experiência gastronômica. Com sua tecnologia de ponta e design ergonômico, o BMX360 é a ferramenta perfeita para você preparar sobremesas, coquetéis, molhos, cremes, gemadas e muito mais!',
      'Além de sua incrível potência de 350W, o mixer e processador Britânia foi projetado pensando no seu conforto e segurança. Seu design ergonômico proporciona um manuseio confortável, e seu sistema com lâmina em aço inoxidável garante durabilidade e eficiência.',
      '',
      'Saída esperada:',
      'Amigaaaa 😍 olha esse achado pra cozinha!',
      '',
      'Esse mixer e processador Britânia é super útil pra fazer sobremesas, molhos, cremes e muito mais! 💕',
      '',
      '💰 DE R$ 199,90 → POR R$ 121,40 🔥',
      '',
      'Esse exemplo demonstra o ESTILO e o nível de síntese desejados. Não copie informações do exemplo para outras mensagens.',
      '',
      'SAÍDA:',
      '- Retorne SOMENTE a mensagem final melhorada.',
      '- Não inclua preâmbulo.',
      '- Não inclua aspas envolvendo a mensagem.',
      '- Não explique o que foi alterado.',
      '- Não apresente alternativas.',
      '- Não inclua análise.',
      '- Não inclua comentários sobre as regras.',
      '- Não inclua raciocínio.',
    ].join('\n');
  }
}
