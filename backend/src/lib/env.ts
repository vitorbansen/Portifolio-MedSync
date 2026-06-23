import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter pelo menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  REDIS_URL: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .pipe(z.string().url().optional()),
  CACHE_TTL_MEDICOS: z.coerce.number().default(60),
  ZAPI_INSTANCE_ID: z.string().optional(),
  ZAPI_TOKEN: z.string().optional(),
  ZAPI_CLIENT_TOKEN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Erro de configuração de ambiente:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

// CORS_ORIGIN aceita uma ou mais origens separadas por virgula
// (ex.: "http://www.medsyncs.com.br,http://medsyncs.com.br,http://54.94.40.80"),
// necessario durante a migracao do IP cru para o dominio proprio.
export const corsOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
