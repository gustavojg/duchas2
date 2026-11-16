import fs from 'node:fs';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { testApp } from '../testing.js';

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]);
const HEIC = new Uint8Array([0, 0, 0, 0x18, ...Buffer.from('ftypheic\0\0\0\0mif1heic', 'latin1')]);
const PDF = new Uint8Array(Buffer.from('%PDF-1.7\n%âãÏÓ\n', 'latin1'));

const VALIDO = {
  nombre: 'Marta Ruiz',
  telefono: '612 34 56 78',
  pieza: 'plato_ducha',
  dano: 'Grieta',
  zona: 'Chamberí',
  mensaje: 'Se sale el agua por la esquina',
  pagina_origen: '/reparar-plato-ducha/',
  privacidad: 'on',
};

function form(campos: Record<string, string | undefined> = VALIDO, foto?: { bytes: Uint8Array; name?: string; type?: string }) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(campos)) if (v !== undefined) fd.append(k, v);
  if (foto) fd.append('foto', new File([foto.bytes as Uint8Array<ArrayBuffer>],foto.name ?? 'foto.jpg', { type: foto.type ?? 'image/jpeg' }));
  return fd;
}

function setup(over: Parameters<typeof testApp>[0] = {}) {
  const t = testApp(over);
  const post = (body: FormData) => t.app.request('/api/contacto', { method: 'POST', body });
  const filas = () => t.deps.db.prepare('SELECT * FROM peticiones').all() as Record<string, unknown>[];
  const fotos = () => {
    const dir = path.join(t.dataDir, 'fotos');
    return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  };
  return { ...t, post, filas, fotos };
}

describe('POST /api/contacto', () => {
  afterEach(() => vi.restoreAllMocks());

  it('(1) envío válido con foto: guarda fila y foto y manda el email con adjunto y todos los campos', async () => {
    const t = setup();
    const res = await t.post(form(VALIDO, { bytes: JPEG }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    const [fila, ...resto] = t.filas();
    expect(resto).toHaveLength(0);
    expect(fila).toMatchObject({
      nombre: 'Marta Ruiz',
      telefono: '+34612345678',
      pieza: 'plato_ducha',
      dano: 'Grieta',
      zona: 'Chamberí',
      pagina_origen: '/reparar-plato-ducha/',
      foto_mime: 'image/jpeg',
      foto_bytes: JPEG.length,
      creada_en: t.clock.now.getTime(),
      privacidad_aceptada_en: t.clock.now.getTime(),
      email_enviado_en: t.clock.now.getTime(),
    });
    expect(t.fotos()).toEqual([`${fila!.id}.jpg`]);
    expect(fila!.foto_fichero).toBe(`${fila!.id}.jpg`);
    expect(t.sent).toHaveLength(1);
    const mail = t.sent[0]!;
    expect(mail.to).toBe('taller@ejemplo.test');
    expect(mail.replyTo).toBeUndefined();
    expect(mail.subject).toBeTruthy();
    for (const v of ['Marta Ruiz', '+34612345678', 'Plato de ducha', 'Grieta', 'Chamberí', 'Se sale el agua por la esquina', '/reparar-plato-ducha/', '2026']) {
      expect(mail.text, v).toContain(v);
    }
    expect(mail.attachments).toHaveLength(1);
    expect(mail.attachments![0]).toMatchObject({ contentType: 'image/jpeg' });
    expect(new Uint8Array(mail.attachments![0]!.content)).toEqual(JPEG);
  });

  it('(1b) sin foto también es válido', async () => {
    const t = setup();
    const res = await t.post(form({ nombre: 'Ana', telefono: '612345678', pieza: 'otro', privacidad: 'on' }));
    expect(res.status).toBe(201);
    expect(t.filas()[0]).toMatchObject({ foto_fichero: null, dano: null, zona: null });
    expect(t.sent[0]!.attachments ?? []).toHaveLength(0);
  });

  it('(2) valida con el esquema compartido y normaliza el teléfono', async () => {
    // Una IP por envío: los intentos inválidos también cuentan para el límite.
    let n = 0;
    const t = setup({ clientIp: () => `198.51.100.${++n}` });
    const err = async (campos: Record<string, string | undefined>) => {
      const res = await t.post(form(campos));
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: string; campos: Record<string, string> };
      expect(body.error).toBe('validacion');
      return body.campos;
    };
    expect(await err({ ...VALIDO, nombre: undefined })).toHaveProperty('nombre');
    expect((await err({ ...VALIDO, telefono: '12345' })).telefono).toBe('El teléfono tiene que tener 9 cifras.');
    expect((await err({ ...VALIDO, telefono: '512345678' })).telefono).toBe('El teléfono tiene que tener 9 cifras.');
    expect((await err({ ...VALIDO, privacidad: undefined })).privacidad).toBe('Marca la casilla de privacidad para enviar.');
    expect(t.filas()).toHaveLength(0);
    expect(t.sent).toHaveLength(0);

    for (const [tel, norm] of [['612345678', '+34612345678'], ['+34 612 34 56 78', '+34612345678'], ['0034912345678', '+34912345678']]) {
      const res = await t.post(form({ ...VALIDO, telefono: tel }));
      expect(res.status, tel).toBe(201);
      expect(t.filas().at(-1)!.telefono).toBe(norm);
    }
  });

  // (3) y (3b) construyen, serializan y parsean varios MB de multipart. Aquí tardan ~100 ms, pero en una máquina
  // lenta o con la suite cargada pueden pasar de los 5 s por defecto de vitest. El coste es de la prueba, no del
  // servidor (app.request() no manda content-length, así que no hay atajo posible): timeout explícito solo aquí.
  const TIMEOUT_CUERPO_GRANDE = 30_000;

  it('(3) foto de más de foto_max_mb ⇒ 413 sin fila ni email', async () => {
    const t = setup();
    const res = await t.post(form(VALIDO, { bytes: new Uint8Array(10 * 1024 * 1024 + 1) }));
    expect(res.status).toBe(413);
    const body = (await res.json()) as { error: string; mensaje: string };
    expect(body.error).toBe('demasiado_grande');
    expect(body.mensaje).toBe('La foto pesa más de 10 MB; prueba con otra o envíala por WhatsApp');
    expect(t.filas()).toHaveLength(0);
    expect(t.sent).toHaveLength(0);
    expect(t.fotos()).toEqual([]);
  }, TIMEOUT_CUERPO_GRANDE);

  it('(3b) un cuerpo mayor que el límite lo corta bodyLimit con 413', async () => {
    const t = setup({ formulario: { retencion_dias: 90, foto_max_mb: 1, limite_envios: 5, ventana_min: 60 } });
    const res = await t.post(form(VALIDO, { bytes: new Uint8Array(3 * 1024 * 1024) }));
    expect(res.status).toBe(413);
    expect(await res.json()).toMatchObject({ error: 'demasiado_grande' });
    expect(t.filas()).toHaveLength(0);
  }, TIMEOUT_CUERPO_GRANDE);

  it('(4) el tipo se decide por los bytes: PDF llamado foto.jpg ⇒ 415, HEIC ⇒ 201', async () => {
    const t = setup();
    const res = await t.post(form(VALIDO, { bytes: PDF, name: 'foto.jpg', type: 'image/jpeg' }));
    expect(res.status).toBe(415);
    expect(await res.json()).toEqual({ error: 'tipo_foto', mensaje: 'Solo se admiten fotos (JPG, PNG, WebP o HEIC)' });
    expect(t.filas()).toHaveLength(0);
    expect(t.fotos()).toEqual([]);

    const ok = await t.post(form(VALIDO, { bytes: HEIC, name: 'IMG_0001.HEIC', type: 'application/octet-stream' }));
    expect(ok.status).toBe(201);
    const fila = t.filas()[0]!;
    expect(fila.foto_fichero).toBe(`${fila.id}.heic`);
    expect(t.fotos()).toEqual([`${fila.id}.heic`]);
  });

  it('(5) honeypot relleno ⇒ 201 idéntico sin fila, email ni foto', async () => {
    const t = setup();
    const res = await t.post(form({ ...VALIDO, web: 'x' }, { bytes: JPEG }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    expect(t.filas()).toHaveLength(0);
    expect(t.sent).toHaveLength(0);
    expect(t.fotos()).toEqual([]);
  });

  it('(6) límite por IP: 5 envíos y el 6º 429; pasada la ventana vuelve a admitir', async () => {
    const t = setup();
    for (let i = 0; i < 5; i++) expect((await t.post(form())).status).toBe(201);
    const res = await t.post(form());
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'limite' });
    expect(t.filas()).toHaveLength(5);
    expect(t.sent).toHaveLength(5);
    t.clock.advance(61);
    expect((await t.post(form())).status).toBe(201);
  });

  it('(6b) otra IP no comparte el límite', async () => {
    let ip = '203.0.113.1';
    const t = setup({ clientIp: () => ip });
    for (let i = 0; i < 5; i++) await t.post(form());
    expect((await t.post(form())).status).toBe(429);
    ip = '198.51.100.7';
    expect((await t.post(form())).status).toBe(201);
  });

  it('(7) si el mailer falla ⇒ 503 y se borran fila y foto, sin datos personales en el log', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = setup({ mailer: { send: async () => { throw new Error('SMTP caído para taller@ejemplo.test'); } } });
    const res = await t.post(form(VALIDO, { bytes: JPEG }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'envio' });
    expect(t.filas()).toHaveLength(0);
    expect(t.fotos()).toEqual([]);
    expect(error).toHaveBeenCalled();
    const log = JSON.stringify(error.mock.calls);
    for (const dato of ['Marta', '612', '203.0.113.1', 'Chamberí', 'taller@ejemplo.test']) expect(log).not.toContain(dato);
  });

  it('(7b) sin emailDestino ⇒ 503 sin guardar nada', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const t = setup({ emailDestino: null });
    const res = await t.post(form(VALIDO, { bytes: JPEG }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'envio' });
    expect(t.filas()).toHaveLength(0);
    expect(t.fotos()).toEqual([]);
    expect(t.sent).toHaveLength(0);
  });

  it('(8) la IP no se guarda en claro y las fotos no se sirven por HTTP', async () => {
    const t = setup();
    await t.post(form(VALIDO, { bytes: JPEG }));
    const hashes = (t.deps.db.prepare('SELECT ip_hash FROM envios_ip').all() as { ip_hash: string }[]).map((r) => r.ip_hash);
    expect(hashes).toHaveLength(1);
    for (const h of hashes) expect(h).not.toContain('203.0.113.1');
    const id = t.filas()[0]!.id as string;
    for (const url of [`/fotos/${id}.jpg`, `/api/contacto/fotos/${id}.jpg`, `/data/fotos/${id}.jpg`]) {
      const res = await t.app.request(url);
      expect(res.status, url).toBe(404);
    }
  });

  it('(9) solo admite POST', async () => {
    const t = setup();
    const res = await t.app.request('/api/contacto');
    expect(res.status).not.toBe(201);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'not_found' });
  });
});
