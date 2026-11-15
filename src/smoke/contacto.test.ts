import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { detectarFoto } from '../domain/foto.js';
import { createMailer } from '../mailer.js';
import { contactoSchema } from '../../web/src/lib/contacto.js';
import {
  emlTieneFotoPng,
  formularioHoneypot,
  formularioTelefonoMalo,
  formularioValido,
  listarEml,
  PNG_MINIMO,
} from './contacto.js';

const tmp = (p: string) => fs.mkdtempSync(path.join(os.tmpdir(), p));
const campos = (fd: FormData) =>
  Object.fromEntries([...fd.entries()].filter(([, v]) => typeof v === 'string'));
const mailerFile = (dataDir: string) => createMailer({ dataDir, mail: { transport: 'file', from: 'x <x@localhost>' } });

describe('piezas del smoke de contacto', () => {
  it('PNG_MINIMO es un PNG para detectarFoto', () => {
    expect(detectarFoto(PNG_MINIMO)?.ext).toBe('png');
  });

  it('formularioValido pasa contactoSchema y trae la foto PNG; el de teléfono malo falla en telefono', () => {
    const fd = formularioValido(PNG_MINIMO);
    expect(contactoSchema.safeParse(campos(fd)).success).toBe(true);
    const foto = fd.get('foto');
    expect(foto).toBeInstanceOf(Blob);
    expect((foto as File).name).toBe('smoke.png');

    const malo = contactoSchema.safeParse(campos(formularioTelefonoMalo()));
    expect(malo.success).toBe(false);
    expect(malo.error!.issues.map((i) => i.path[0])).toContain('telefono');

    expect(formularioHoneypot().get('web')).toBe('relleno');
    expect(formularioTelefonoMalo().get('telefono')).toBe('123');
  });

  it('listarEml da [] sin mail/ y los nombres de los .eml si los hay', () => {
    const dir = tmp('smoke-');
    expect(listarEml(dir)).toEqual([]);
    fs.mkdirSync(path.join(dir, 'mail'));
    fs.writeFileSync(path.join(dir, 'mail', 'a.eml'), 'x');
    fs.writeFileSync(path.join(dir, 'mail', 'otro.txt'), 'x');
    expect(listarEml(dir)).toEqual(['a.eml']);
  });

  it('emlTieneFotoPng reconoce el adjunto de un .eml real de createMailer', async () => {
    const conDir = tmp('smoke-mail-');
    await mailerFile(conDir).send({
      to: 'a@localhost',
      subject: 'con foto',
      text: 'hola',
      attachments: [{ filename: 'f.png', content: Buffer.from(PNG_MINIMO), contentType: 'image/png' }],
    });
    const [con] = listarEml(conDir);
    expect(emlTieneFotoPng(fs.readFileSync(path.join(conDir, 'mail', con!), 'utf8'))).toBe(true);

    const sinDir = tmp('smoke-mail-');
    await mailerFile(sinDir).send({ to: 'a@localhost', subject: 'sin foto', text: 'hola' });
    const [sin] = listarEml(sinDir);
    expect(emlTieneFotoPng(fs.readFileSync(path.join(sinDir, 'mail', sin!), 'utf8'))).toBe(false);
  });
});
