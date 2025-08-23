import { verifyToken } from '@clerk/backend';
import { Request } from 'express';

// Derivamos o tipo do payload diretamente do tipo de retorno da função verifyToken.
// Isso é mais robusto e evita problemas de importação de tipos.
type ClerkJwtPayload = Awaited<ReturnType<typeof verifyToken>>;

// Definindo uma interface para estender o objeto Request do Express
export interface RequestWithUser extends Request {
  user: ClerkJwtPayload;
}
