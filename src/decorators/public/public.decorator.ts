import { SetMetadata } from '@nestjs/common';

// Chave para identificar metadados de rotas públicas
export const IS_PUBLIC_KEY = 'isPublic';

// O decorator @Public() que atribui o metadado 'isPublic: true' a um endpoint
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
