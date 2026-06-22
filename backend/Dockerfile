FROM node:20-alpine AS base

WORKDIR /app

RUN apk add --no-cache openssl

# "prisma generate" so le o schema (nao conecta no banco), mas o prisma.config.ts
# exige DATABASE_URL resolvivel. O .env real (com a URL de verdade) fica de fora
# da imagem via .dockerignore; este placeholder so existe para o build passar.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public"

COPY package*.json ./
COPY prisma ./prisma

# --- Estagio de desenvolvimento (hot-reload, usado pelo docker-compose.yml) ---
FROM base AS dev

RUN npm install
COPY . .
RUN npx prisma generate

EXPOSE 3333

CMD ["npm", "run", "dev"]

# --- Estagio de build (compila TypeScript, usado apenas para gerar o estagio prod) ---
FROM base AS build

RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# --- Estagio de producao (usado pelo docker-compose.prod.yml) ---
FROM node:20-alpine AS prod

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./

EXPOSE 3333

CMD ["node", "dist/server.js"]
