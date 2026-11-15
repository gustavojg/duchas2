import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
import type { Config } from './config.js';

export interface Mail { to: string; subject: string; text: string; html?: string; replyTo?: string }
export interface Mailer { send(mail: Mail): Promise<void> }

/**
 * Correo saliente. `file` (por defecto, sin red): cada mensaje se guarda como .eml en DATA_DIR/mail/,
 * para desarrollo, tests y staging. `smtp`: envío real con SMTP_URL (secreto del producto, nunca en el repo).
 */
export function createMailer(config: Pick<Config, 'dataDir' | 'mail'>): Mailer {
  const { from } = config.mail;
  if (config.mail.transport === 'smtp') {
    const transport = nodemailer.createTransport(config.mail.smtpUrl!);
    return { send: async (mail) => void (await transport.sendMail({ from, ...mail })) };
  }
  const dir = path.join(config.dataDir, 'mail');
  const transport = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'unix' });
  return {
    async send(mail) {
      const info = await transport.sendMail({ from, ...mail });
      fs.mkdirSync(dir, { recursive: true });
      const name = `${new Date().toISOString().replace(/[:.]/g, '-')}-${info.messageId.replace(/[^\w.-]/g, '')}.eml`;
      fs.writeFileSync(path.join(dir, name), info.message as Buffer);
    },
  };
}
