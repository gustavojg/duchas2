import { afterEach, describe, expect, it, vi } from 'vitest';
import { fotoDemasiadoGrande, MENSAJES } from '../lib/contacto';
import { enviarContacto, interpretarRespuesta, validarCliente, validarFoto } from './EnviarContacto';
import { VALORES_INICIALES, type ValoresContacto } from './FormularioContacto';

const MB = 1024 * 1024;
const foto = (bytes: number, nombre: string, type: string) => new File([new Uint8Array(bytes)], nombre, { type });
const correctos: ValoresContacto = {
  ...VALORES_INICIALES,
  nombre: 'Marta',
  telefono: '611 22 33 44',
  pieza: 'banera',
  zona: 'Carabanchel',
  privacidad: true,
};

describe('validarCliente', () => {
  it('vacío: errores de nombre, teléfono y privacidad con los textos de MENSAJES, y ninguno más', () => {
    expect(validarCliente(VALORES_INICIALES, null, 10)).toEqual({
      nombre: MENSAJES.nombre,
      telefono: MENSAJES.telefono_falta,
      privacidad: MENSAJES.privacidad,
    });
  });

  it('teléfono de 5 cifras', () => {
    expect(validarCliente({ ...correctos, telefono: '12345' }, null, 10)).toEqual({
      telefono: 'El teléfono tiene que tener 9 cifras.',
    });
  });

  it('foto de 11 MB con límite 10', () => {
    const e = validarCliente(correctos, foto(11 * MB, 'grande.jpg', 'image/jpeg'), 10);
    expect(e).toEqual({ foto: fotoDemasiadoGrande(10) });
    expect(e.foto).toMatch(/^La foto pesa más de 10 MB/);
  });

  it('foto gif', () => {
    expect(validarCliente(correctos, foto(10, 'a.gif', 'image/gif'), 10)).toEqual({
      foto: 'Solo se admiten fotos (JPG, PNG, WebP o HEIC)',
    });
  });

  it('.heic con type vacío es válida, y también jpeg, png y webp', () => {
    expect(validarCliente(correctos, foto(10, 'IMG_1.HEIC', ''), 10)).toEqual({});
    for (const t of ['image/jpeg', 'image/png', 'image/webp', 'image/heic']) {
      expect(validarCliente(correctos, foto(10, 'x', t), 10), t).toEqual({});
    }
  });

  it('datos correctos sin foto: sin errores', () => {
    expect(validarCliente(correctos, null, 10)).toEqual({});
  });
});

describe('validarFoto', () => {
  it('11 MB con límite de 10 → aviso de tamaño', () => {
    expect(validarFoto(foto(11 * MB, 'grande.jpg', 'image/jpeg'), 10)).toBe(fotoDemasiadoGrande(10));
  });
  it('gif → aviso de tipo', () => {
    expect(validarFoto(foto(100, 'gato.gif', 'image/gif'), 10)).toBe(MENSAJES.foto_tipo);
  });
  it('.heic con type vacío es válida', () => {
    expect(validarFoto(foto(100, 'IMG_0001.HEIC', ''), 10)).toBeUndefined();
  });
  it('jpeg pequeño es válido', () => {
    expect(validarFoto(foto(100, 'dano.jpg', 'image/jpeg'), 10)).toBeUndefined();
  });
});

describe('interpretarRespuesta', () => {
  it('201 → ok', () => {
    expect(interpretarRespuesta(201, { ok: true })).toEqual({ estado: 'ok', errores: {} });
  });
  it('400 → errores de los campos', () => {
    expect(interpretarRespuesta(400, { error: 'validacion', campos: { telefono: 'x' } })).toEqual({
      estado: 'inicial',
      errores: { telefono: 'x' },
    });
  });
  it('413 → errores.foto con el mensaje del servidor o el de por defecto', () => {
    expect(interpretarRespuesta(413, { error: 'demasiado_grande', mensaje: 'La foto pesa más de 8 MB; prueba con otra o envíala por WhatsApp' })).toEqual({
      estado: 'inicial',
      errores: { foto: 'La foto pesa más de 8 MB; prueba con otra o envíala por WhatsApp' },
    });
    expect(interpretarRespuesta(413, null, 10)).toEqual({ estado: 'inicial', errores: { foto: fotoDemasiadoGrande(10) } });
  });
  it('415 → errores.foto de tipo', () => {
    expect(interpretarRespuesta(415, { error: 'tipo_foto' })).toEqual({ estado: 'inicial', errores: { foto: MENSAJES.foto_tipo } });
  });
  it('429 → limite', () => {
    expect(interpretarRespuesta(429, { error: 'limite' })).toEqual({ estado: 'limite', errores: {} });
  });
  it('500 y 503 → error', () => {
    expect(interpretarRespuesta(500, null)).toEqual({ estado: 'error', errores: {} });
    expect(interpretarRespuesta(503, { error: 'envio' })).toEqual({ estado: 'error', errores: {} });
  });
});

describe('enviarContacto (fetch simulado)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('hace POST multipart a /api/contacto con los nombres de campo esperados y la foto', async () => {
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => new Response(JSON.stringify({ ok: true }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    const f = foto(10, 'plato.jpg', 'image/jpeg');
    const r = await enviarContacto({ ...correctos, dano: 'Grieta', mensaje: 'Hola' }, f, '/contacto/', 10);
    expect(r).toEqual({ estado: 'ok', errores: {} });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/contacto');
    expect(init.method).toBe('POST');
    const body = init.body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect([...new Set(body.keys())].sort()).toEqual(
      ['dano', 'foto', 'mensaje', 'nombre', 'pagina_origen', 'pieza', 'privacidad', 'telefono', 'web', 'zona'].sort(),
    );
    expect(body.get('nombre')).toBe('Marta');
    expect(body.get('telefono')).toBe('611 22 33 44');
    expect(body.get('pieza')).toBe('banera');
    expect(body.get('privacidad')).toBe('on');
    expect(body.get('pagina_origen')).toBe('/contacto/');
    expect(body.get('web')).toBe('');
    expect((body.get('foto') as File).name).toBe('plato.jpg');
  });

  it('sin foto no manda el campo foto', async () => {
    const fetchMock = vi.fn(async (_url: string, _init: RequestInit) => new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    await enviarContacto(correctos, null, '/', 10);
    expect((fetchMock.mock.calls[0][1].body as FormData).has('foto')).toBe(false);
  });

  it('traduce la respuesta del servidor (429)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'limite' }), { status: 429 })));
    expect(await enviarContacto(correctos, null, '/', 10)).toEqual({ estado: 'limite', errores: {} });
  });

  it('ante una excepción de red devuelve estado error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    }));
    expect(await enviarContacto(correctos, null, '/', 10)).toEqual({ estado: 'error', errores: {} });
  });

  it('cuerpo que no es JSON en un 502 → error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>Bad gateway</html>', { status: 502 })));
    expect(await enviarContacto(correctos, null, '/', 10)).toEqual({ estado: 'error', errores: {} });
  });
});
