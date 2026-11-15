import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';
import { createMailer } from './mailer.js';

describe('mailer file', () => {
  it('guarda cada correo como .eml en DATA_DIR/mail sin red', async () => {
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'data-'));
    const mailer = createMailer(loadConfig({ DATA_DIR: dataDir }));
    await mailer.send({ to: 'ana@ejemplo.test', subject: 'Hola', text: 'Prueba' });
    const files = fs.readdirSync(path.join(dataDir, 'mail'));
    expect(files).toHaveLength(1);
    const eml = fs.readFileSync(path.join(dataDir, 'mail', files[0]!), 'utf8');
    expect(eml).toContain('To: ana@ejemplo.test');
    expect(eml).toContain('Subject: Hola');
  });

  it('smtp exige SMTP_URL', () => {
    expect(() => loadConfig({ MAIL_TRANSPORT: 'smtp' })).toThrow(/SMTP_URL/);
  });
});
