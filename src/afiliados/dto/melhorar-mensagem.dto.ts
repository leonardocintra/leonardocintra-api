import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const TONES = ['casual', 'entusiasmado', 'direto'] as const;
export type Tone = (typeof TONES)[number];

export class MelhorarMensagemDto {
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsIn(TONES)
  tone?: Tone;
}
