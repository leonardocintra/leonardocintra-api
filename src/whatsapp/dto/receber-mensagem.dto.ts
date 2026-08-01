import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class KeyDto {
  @IsString()
  remoteJid!: string;

  @IsBoolean()
  fromMe!: boolean;

  @IsString()
  id!: string;

  @IsString()
  participant!: string;

  @IsOptional()
  @IsString()
  participantAlt?: string;

  @IsString()
  addressingMode!: string;
}

export class MessageDto {
  @IsOptional()
  @IsObject()
  senderKeyDistributionMessage?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  messageContextInfo?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  conversation?: string;
}

export class DataDto {
  @ValidateNested()
  @Type(() => KeyDto)
  key!: KeyDto;

  @IsString()
  pushName!: string;

  @IsString()
  status!: string;

  @ValidateNested()
  @Type(() => MessageDto)
  message!: MessageDto;

  @IsOptional()
  @IsObject()
  contextInfo?: Record<string, unknown> | null;

  @IsString()
  messageType!: string;

  @IsNumber()
  messageTimestamp!: number;

  @IsString()
  instanceId!: string;

  @IsString()
  source!: string;
}

export class BodyDto {
  @IsString()
  event!: string;

  @IsString()
  instance!: string;

  @ValidateNested()
  @Type(() => DataDto)
  data!: DataDto;

  @IsString()
  destination!: string;

  @IsString()
  date_time!: string;

  @IsString()
  sender!: string;

  @IsString()
  server_url!: string;

  @IsString()
  apikey!: string;
}

export class ReceberMensagemDto {
  @IsObject()
  headers!: Record<string, string>;

  @IsObject()
  params!: Record<string, unknown>;

  @IsObject()
  query!: Record<string, unknown>;

  @ValidateNested()
  @Type(() => BodyDto)
  body!: BodyDto;

  @IsString()
  webhookUrl!: string;

  @IsString()
  executionMode!: string;
}
