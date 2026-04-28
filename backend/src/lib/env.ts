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
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Erro de configuração de ambiente:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
