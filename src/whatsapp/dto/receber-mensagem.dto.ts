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
  messageContextInfo?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  conversation?: string;
}

export class ContextInfoDto {
  @IsOptional()
  @IsObject()
  mentionedJid?: unknown[];

  @IsOptional()
  @IsObject()
  groupMentions?: unknown[];

  @IsOptional()
  @IsObject()
  statusAttributions?: unknown[];

  @IsOptional()
  @IsString()
  stanzaId?: string;

  @IsOptional()
  @IsString()
  participant?: string;

  @IsOptional()
  @IsObject()
  quotedMessage?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  pairedMediaType?: number;

  @IsOptional()
  @IsObject()
  contextInfo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  scansSidecar?: Record<string, number>;

  @IsOptional()
  @IsObject()
  midQualityFileSha256?: Record<string, number>;

  @IsOptional()
  @IsObject()
  fileSha256?: Record<string, number>;

  @IsOptional()
  @IsObject()
  mediaKey?: Record<string, number>;

  @IsOptional()
  @IsObject()
  fileEncSha256?: Record<string, number>;

  @IsOptional()
  @IsObject()
  fileLength?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  mediaKeyTimestamp?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  jpegThumbnail?: Record<string, number>;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  mimetype?: string;

  @IsOptional()
  @IsString()
  directPath?: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsObject()
  interactiveAnnotations?: unknown[];

  @IsOptional()
  @IsObject()
  annotations?: unknown[];

  @IsOptional()
  @IsObject()
  scanLengths?: number[];
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
  @ValidateNested()
  @Type(() => ContextInfoDto)
  contextInfo?: ContextInfoDto;

  @IsString()
  messageType!: string;

  @IsNumber()
  messageTimestamp!: number;

  @IsString()
  instanceId!: string;

  @IsString()
  source!: string;
}

export class ReceberMensagemDto {
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
