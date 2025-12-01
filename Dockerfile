FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma

RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

# Verifique se o build foi bem-sucedido
RUN ls -la dist/

# ===============================
FROM node:22-alpine AS production
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --only=production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

# Verifique os arquivos copiados
RUN ls -la dist/

EXPOSE 3000

CMD ["node", "dist/main"]
