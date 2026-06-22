FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

# --- Estagio de desenvolvimento (hot-reload, usado pelo docker-compose.yml) ---
FROM base AS dev

RUN npm install
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# --- Estagio de build (compila o Next.js, usado apenas para gerar o estagio prod) ---
FROM base AS build

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm install
COPY . .
RUN npm run build

# --- Estagio de producao (usado pelo docker-compose.prod.yml) ---
# output: 'standalone' no next.config.mjs gera um server.js autocontido
# com somente os node_modules realmente usados, sem precisar copiar node_modules inteiro.
FROM node:20-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
