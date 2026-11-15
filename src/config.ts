import { randomBytes } from 'node:crypto';
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
  MAIL_FROM: z.string().default('duchas2 <no-reply@localhost>'),
  // Sal del HMAC de la IP (límite por IP). Secreto: `sf secret set`, nunca en el repo.
  IP_SALT: z.string().optional(),
  // 1 detrás de un proxy de confianza: la IP del cliente sale del primer elemento de X-Forwarded-For.
  TRUST_PROXY: z.enum(['0', '1']).default('0'),
  // Override de email_destino de web/content/negocio.json.
  EMAIL_DESTINO: z.string().optional(),
});

export interface Config {
  host: string;
  port: number;
  dataDir: string;
  webDir: string;
  baseUrl: string;
  mail: { transport: 'file' | 'smtp'; smtpUrl?: string; from: string };
  ipSalt: string;
  trustProxy: boolean;
  emailDestino?: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const e = Env.parse(env);
  if (e.MAIL_TRANSPORT === 'smtp' && !e.SMTP_URL) throw new Error('MAIL_TRANSPORT=smtp necesita SMTP_URL');
  let ipSalt = e.IP_SALT?.trim();
  if (!ipSalt) {
    ipSalt = randomBytes(32).toString('hex');
    console.warn('aviso: falta IP_SALT; se usa una sal aleatoria y el límite por IP no sobrevive a reinicios. Fija IP_SALT.');
  }
  return {
    host: e.HOST,
    port: e.PORT,
    dataDir: path.resolve(e.DATA_DIR),
    webDir: path.resolve(e.WEB_DIR),
    baseUrl: e.BASE_URL.replace(/\/+$/, ''),
    mail: { transport: e.MAIL_TRANSPORT, smtpUrl: e.SMTP_URL, from: e.MAIL_FROM },
    ipSalt,
    trustProxy: e.TRUST_PROXY === '1',
    emailDestino: e.EMAIL_DESTINO?.trim() || undefined,
  };
}
