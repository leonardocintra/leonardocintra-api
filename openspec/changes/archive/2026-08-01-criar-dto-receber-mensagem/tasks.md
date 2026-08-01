## 1. Classes DTO aninhadas

- [x] 1.1 Criar classe `KeyDto` com campos `remoteJid` (@IsString), `fromMe` (@IsBoolean), `id` (@IsString), `participant` (@IsString), `participantAlt` (@IsOptional + @IsString), `addressingMode` (@IsString)
- [x] 1.2 Criar classe `MessageDto` com campos opcionais `senderKeyDistributionMessage` (@IsOptional + @IsObject), `messageContextInfo` (@IsOptional + @IsObject), `conversation` (@IsOptional + @IsString)
- [x] 1.3 Criar classe `DataDto` com campos `key` (@ValidateNested + @Type KeyDto), `pushName` (@IsString), `status` (@IsString), `message` (@ValidateNested + @Type MessageDto), `contextInfo` (@IsOptional + @IsObject), `messageType` (@IsString), `messageTimestamp` (@IsNumber), `instanceId` (@IsString), `source` (@IsString)
- [x] 1.4 Criar classe `BodyDto` com campos `event` (@IsString), `instance` (@IsString), `data` (@ValidateNested + @Type DataDto), `destination` (@IsString), `date_time` (@IsString), `sender` (@IsString), `server_url` (@IsString), `apikey` (@IsString)
- [x] 1.5 Criar classe `ReceberMensagemDto` (raiz) com campos `headers` (@IsObject), `params` (@IsObject), `query` (@IsObject), `body` (@ValidateNested + @Type BodyDto), `webhookUrl` (@IsString), `executionMode` (@IsString)

## 2. Imports e dependências

- [x] 2.1 Adicionar imports de `class-validator` (@IsString, @IsNumber, @IsBoolean, @IsOptional, @IsObject, @ValidateNested) e `class-transformer` (@Type) no topo do arquivo
- [x] 2.2 Verificar que `class-validator` e `class-transformer` já estão instalados no projeto (npm ls class-validator class-transformer)

## 3. Validação

- [x] 3.1 Rodar `npx tsc --noEmit` para verificar erros de tipagem no arquivo criado
- [x] 3.2 Rodar `lsp_diagnostics` no arquivo `src/whatsapp/dto/receber-mensagem.dto.ts` para confirmar zero erros
- [x] 3.3 Verificar que todas as classes estão exportadas corretamente (export class)
