import { IsDate, IsEmail, IsNumber, IsNumberString, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export class CreateRegistroVisitaDto {
  @IsString()
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres.' })
  nome!: string;

  @IsString()
  dataVisita!: string;

  @IsString()
  @MaxLength(100, { message: 'A cidade deve ter no máximo 100 caracteres.' })
  cidade!: string;

  @IsString()
  @MaxLength(50, { message: 'O país deve ter no máximo 50 caracteres.' })
  pais!: string;

  @IsNumber()
  @Min(1, { message: 'O número de pessoas deve ser no mínimo 1.' })
  numeroPessoas!: number;

  @IsString()
  mensagem!: string;

  @IsEmail({}, { message: 'O email fornecido não é válido.' })
  email!: string;

  @IsNumberString({}, { message: 'O número de WhatsApp deve conter apenas números.' })
  @MaxLength(20, { message: 'O número de WhatsApp deve ter no máximo 20 caracteres.' })
  whatsapp!: string;
}
