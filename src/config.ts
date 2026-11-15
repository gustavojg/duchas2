import path from 'node:path';
import { z } from 'zod';

/**
 * Configuración por entorno. Único sitio que lee process.env; nunca secretos en el repo
 * (`.env.example` solo lleva nombres). Las rutas relativas se resuelven contra el cwd (la raíz del repo).
 */
const Env = z.object({
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATA_DIR: z.string().default('./data'),
  WEB_DIR: z.string().default('./web/out'),
  BASE_URL: z.string().url().default('http://127.0.0.1:3000'),
  MAIL_TRANSPORT: z.enum(['file', 'smtp']).default('file'),
  SMTP_URL: z.string().optional(),
  MAIL_FROM: z.string().default('factory <no-reply@localhost>'),
});

export interface Config {
  host: string;
  port: number;
  dataDir: string;
  webDir: string;
  baseUrl: string;
  mail: { transport: 'file' | 'smtp'; smtpUrl?: string; from: string };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const e = Env.parse(env);
  if (e.MAIL_TRANSPORT === 'smtp' && !e.SMTP_URL) throw new Error('MAIL_TRANSPORT=smtp necesita SMTP_URL');
  return {
    host: e.HOST,
    port: e.PORT,
    dataDir: path.resolve(e.DATA_DIR),
    webDir: path.resolve(e.WEB_DIR),
    baseUrl: e.BASE_URL.replace(/\/+$/, ''),
    mail: { transport: e.MAIL_TRANSPORT, smtpUrl: e.SMTP_URL, from: e.MAIL_FROM },
  };
}
