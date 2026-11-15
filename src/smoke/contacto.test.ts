import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { detectarFoto } from '../domain/foto.js';
import { createMailer } from '../mailer.js';
import { testApp } from '../testing.js';
import { contactoSchema } from '../../web/src/lib/contacto.js';
import {
  ejecutarSmoke,
  emlTieneFotoPng,
  formularioHoneypot,
  formularioTelefonoMalo,
  formularioValido,
  leerEntornoSmoke,
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

describe('leerEntornoSmoke', () => {
  it('por defecto apunta a 127.0.0.1:3000 y a ./data absoluto', () => {
    const e = leerEntornoSmoke({});
    expect(e.baseUrl).toBe('http://127.0.0.1:3000');
    expect(e.dataDir).toBe(path.resolve('./data'));
    expect(path.isAbsolute(e.dataDir)).toBe(true);
    expect(e.local).toBe(true);
  });

  it('quita la barra final de BASE_URL y marca si no es local', () => {
    const e = leerEntornoSmoke({ BASE_URL: 'https://staging.ejemplo.test/', DATA_DIR: 'data/smoke' });
    expect(e.baseUrl).toBe('https://staging.ejemplo.test');
    expect(e.dataDir).toBe(path.resolve('data/smoke'));
    expect(e.local).toBe(false);
  });

  it('con BASE_URL inválida lanza un error claro', () => {
    expect(() => leerEntornoSmoke({ BASE_URL: 'no es una url' })).toThrow(/BASE_URL/);
    expect(() => leerEntornoSmoke({ BASE_URL: 'ftp://x.test' })).toThrow(/BASE_URL/);
  });

  it('con usuario o contraseña en BASE_URL lanza sin repetir las credenciales', () => {
    for (const BASE_URL of [
      'https://usuario:token@staging.ejemplo.test',
      'https://usuario@staging.ejemplo.test',
      'ftp://usuario:token@staging.ejemplo.test',
      'https://usuario:token@',
    ]) {
      let mensaje = '';
      try {
        leerEntornoSmoke({ BASE_URL });
      } catch (e) {
        mensaje = (e as Error).message;
      }
      expect(mensaje).toMatch(/BASE_URL/);
      expect(mensaje).not.toContain('token');
      expect(mensaje).not.toContain('usuario');
    }
  });
});

describe('ejecutarSmoke', () => {
  const montar = (over: Parameters<typeof testApp>[0] = {}) => {
    const dataDir = tmp('smoke-app-');
    const t = testApp({ dataDir, mailer: mailerFile(dataDir), ...over });
    const fetchFn = async (url: string, init?: RequestInit) => t.app.request(new URL(url).pathname, init);
    return { ...t, fetchFn };
  };
  const filasIp = (db: ReturnType<typeof testApp>['deps']['db']) =>
    (db.prepare('SELECT COUNT(*) AS n FROM envios_ip').get() as { n: number }).n;

  it('camino feliz: 4 pasos ok, 1 .eml con la foto y solo 3 intentos contra el límite', async () => {
    const { fetchFn, dataDir, deps } = montar();
    const r = await ejecutarSmoke({ baseUrl: 'http://127.0.0.1:3000', dataDir, fetchFn });
    expect(r.pasos).toHaveLength(4);
    expect(r.pasos.every((p) => p.ok)).toBe(true);
    expect(r.ok).toBe(true);
    const eml = listarEml(dataDir);
    expect(eml).toHaveLength(1);
    expect(emlTieneFotoPng(fs.readFileSync(path.join(dataDir, 'mail', eml[0]!), 'utf8'))).toBe(true);
    expect(filasIp(deps.db)).toBe(3);
    for (const p of r.pasos) {
      expect(p.detalle).not.toMatch(/203\.0\.113\.1|600123456|Smoke staging/);
    }
  });

  it('sin email de destino el paso 1 falla y apunta a EMAIL_DESTINO', async () => {
    const { fetchFn, dataDir } = montar({ emailDestino: null });
    const r = await ejecutarSmoke({ baseUrl: 'http://127.0.0.1:3000', dataDir, fetchFn });
    expect(r.ok).toBe(false);
    expect(r.pasos[0]!.ok).toBe(false);
    expect(r.pasos[0]!.detalle).toContain('EMAIL_DESTINO');
  });

  it('con el límite por IP agotado falla y lo explica', async () => {
    const { fetchFn, dataDir } = montar({
      formulario: { retencion_dias: 90, foto_max_mb: 10, limite_envios: 1, ventana_min: 60 },
    });
    const r = await ejecutarSmoke({ baseUrl: 'http://127.0.0.1:3000', dataDir, fetchFn });
    expect(r.ok).toBe(false);
    expect(r.pasos.some((p) => !p.ok && p.detalle.includes('límite por IP'))).toBe(true);
  });

  it('si GET /api/contacto respondiera 2xx el paso 4 falla', async () => {
    const { fetchFn: real, dataDir } = montar();
    const fetchFn = async (url: string, init?: RequestInit) =>
      (init?.method ?? 'GET') === 'GET' ? new Response('{}', { status: 200 }) : real(url, init);
    const r = await ejecutarSmoke({ baseUrl: 'http://127.0.0.1:3000', dataDir, fetchFn });
    expect(r.ok).toBe(false);
    expect(r.pasos.slice(0, 3).every((p) => p.ok)).toBe(true);
    expect(r.pasos[3]!.ok).toBe(false);
  });

  it('si DATA_DIR/mail no se puede leer (ENOTDIR) da un paso fallido sin excepción ni envíos', async () => {
    const dataDir = tmp('smoke-enotdir-');
    fs.writeFileSync(path.join(dataDir, 'mail'), 'no soy un directorio');
    let llamadas = 0;
    const fetchFn = async () => {
      llamadas++;
      return new Response(null, { status: 201 });
    };
    const r = await ejecutarSmoke({ baseUrl: 'http://127.0.0.1:3000', dataDir, fetchFn });
    expect(r.ok).toBe(false);
    expect(llamadas).toBe(0);
    const fallido = r.pasos.find((p) => !p.ok)!;
    expect(fallido.detalle).toContain('DATA_DIR');
    expect(fallido.detalle).toContain('ENOTDIR');
    expect(fallido.detalle).toContain(path.join(dataDir, 'mail'));
  });

  it('un error de red de fetch se sigue propagando (el script lo muestra como fallo de conexión)', async () => {
    const dataDir = tmp('smoke-red-');
    const fetchFn = async (): Promise<Response> => {
      throw new TypeError('fetch failed');
    };
    await expect(ejecutarSmoke({ baseUrl: 'http://127.0.0.1:3000', dataDir, fetchFn })).rejects.toThrow(TypeError);
  });
});
