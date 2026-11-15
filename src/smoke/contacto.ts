/**
 * Piezas de `pnpm smoke:contacto`: comprueban contra un servidor en marcha (staging) el contrato de
 * POST /api/contacto. Sin process.env ni red propia: el entorno lo lee scripts/smoke-contacto.ts y el
 * fetch llega por parámetro.
 */
import fs from 'node:fs';
import path from 'node:path';

/** PNG válido de 1x1 píxel (cabecera mágica, IHDR, IDAT e IEND). */
export const PNG_MINIMO: Uint8Array = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
  (c) => c.charCodeAt(0),
);

/** Campos de una petición de prueba: sin datos personales reales. */
function base(): FormData {
  const fd = new FormData();
  fd.set('nombre', 'Smoke staging');
  fd.set('telefono', '600123456');
  fd.set('pieza', 'plato_ducha');
  fd.set('privacidad', 'on');
  return fd;
}

/** Petición válida con la foto PNG adjunta como smoke.png. */
export function formularioValido(png: Uint8Array): FormData {
  const fd = base();
  fd.set('foto', new Blob([new Uint8Array(png)],{ type: 'image/png' }), 'smoke.png');
  return fd;
}

/** Igual que la válida pero con el honeypot `web` relleno. */
export function formularioHoneypot(): FormData {
  const fd = formularioValido(PNG_MINIMO);
  fd.set('web', 'relleno');
  return fd;
}

/** Igual que la válida pero con un teléfono que no tiene 9 cifras. */
export function formularioTelefonoMalo(): FormData {
  const fd = formularioValido(PNG_MINIMO);
  fd.set('telefono', '123');
  return fd;
}

/** Nombres de los .eml de DATA_DIR/mail, o [] si el directorio no existe. */
export function listarEml(dataDir: string): string[] {
  try {
    return fs
      .readdirSync(path.join(dataDir, 'mail'))
      .filter((f) => f.endsWith('.eml'))
      .sort();
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
}

export interface EntornoSmoke { baseUrl: string; dataDir: string; local: boolean }

const HOSTS_LOCALES = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

/**
 * BASE_URL (por defecto http://127.0.0.1:3000, sin barra final) y DATA_DIR (por defecto ./data, absoluto).
 * Recibe el entorno por parámetro: process.env solo se lee en scripts/smoke-contacto.ts.
 * `local` es false si BASE_URL no apunta a esta máquina (los .eml se leen del disco local).
 */
export function leerEntornoSmoke(env: Record<string, string | undefined>): EntornoSmoke {
  const bruta = env.BASE_URL?.trim() || 'http://127.0.0.1:3000';
  let url: URL;
  try {
    url = new URL(bruta);
  } catch {
    throw new Error(`BASE_URL no es una URL válida: «${bruta}» (ejemplo: http://127.0.0.1:3000)`);
  }
  // Antes que cualquier otro error que repita «bruta»: nunca imprimir credenciales.
  if (url.username || url.password) {
    throw new Error(
      'BASE_URL no debe llevar credenciales (nombre ni contraseña antes de «@»): se imprimirían en los logs y fetch no admite credenciales en la URL',
    );
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`BASE_URL debe empezar por http:// o https://: «${bruta}»`);
  }
  return {
    baseUrl: bruta.replace(/\/+$/, ''),
    dataDir: path.resolve(env.DATA_DIR?.trim() || './data'),
    local: HOSTS_LOCALES.has(url.hostname),
  };
}

export interface PasoSmoke { nombre: string; ok: boolean; detalle: string }
export interface ResultadoSmoke { ok: boolean; pasos: PasoSmoke[] }
export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

const LIMITE_AGOTADO = 'límite por IP agotado (5 por 60 min); espera o usa otro origen';
const SIN_EMAIL_DESTINO = '503: ¿falta EMAIL_DESTINO en el arranque del staging?';

/** Cuerpo JSON de la respuesta o null; nunca se copia al detalle (podría llevar datos). */
async function json(res: Response): Promise<Record<string, unknown> | null> {
  try {
    const v: unknown = await res.json();
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/**
 * Ejecuta el smoke contra `baseUrl` y lee los .eml de `dataDir`. Solo los pasos 1-3 son POST (cuentan contra el
 * límite por IP: 3 de 5 por ventana); el 4 es un GET. Sin reintentos ni envíos extra. No llama a process.exit.
 */
export async function ejecutarSmoke(opts: { baseUrl: string; dataDir: string; fetchFn?: FetchFn }): Promise<ResultadoSmoke> {
  const pasos: PasoSmoke[] = [];
  try {
    await pasosSmoke(opts, pasos);
  } catch (e) {
    // Los errores de disco (DATA_DIR/mail ilegible) se convierten en un paso fallido; los de red se propagan.
    const code = (e as NodeJS.ErrnoException | null)?.code;
    if (typeof code !== 'string' || (e as NodeJS.ErrnoException).path === undefined) throw e;
    pasos.push({
      nombre: 'lectura de DATA_DIR/mail',
      ok: false,
      detalle: `no se puede leer ${path.join(opts.dataDir, 'mail')} (${code}); revisa DATA_DIR y sus permisos`,
    });
  }
  return { ok: pasos.every((p) => p.ok), pasos };
}

async function pasosSmoke(
  opts: { baseUrl: string; dataDir: string; fetchFn?: FetchFn },
  pasos: PasoSmoke[],
): Promise<void> {
  const { baseUrl, dataDir, fetchFn = fetch } = opts;
  const url = `${baseUrl.replace(/\/+$/, '')}/api/contacto`;
  const post = (body: FormData) => fetchFn(url, { method: 'POST', body });
  const paso = (nombre: string, ok: boolean, detalle: string) => void pasos.push({ nombre, ok, detalle });
  const comun = (status: number, esperado: number) =>
    status === 429 ? LIMITE_AGOTADO : `se esperaba ${esperado} y llegó ${status}`;

  // 1. Petición válida con foto: 201 y exactamente un .eml nuevo con el PNG adjunto.
  {
    const nombre = 'POST válido con foto → 201 y .eml con la foto';
    const antes = new Set(listarEml(dataDir));
    const res = await post(formularioValido(PNG_MINIMO));
    await res.body?.cancel();
    if (res.status !== 201) {
      paso(nombre, false, res.status === 503 ? SIN_EMAIL_DESTINO : comun(res.status, 201));
    } else {
      const nuevos = listarEml(dataDir).filter((f) => !antes.has(f));
      if (nuevos.length !== 1) {
        paso(nombre, false, `201, pero hay ${nuevos.length} .eml nuevos en ${path.join(dataDir, 'mail')} (se esperaba 1)`);
      } else if (!emlTieneFotoPng(fs.readFileSync(path.join(dataDir, 'mail', nuevos[0]!), 'utf8'))) {
        paso(nombre, false, `201, pero el .eml ${nuevos[0]} no trae la foto PNG adjunta`);
      } else {
        paso(nombre, true, `201 y ${nuevos[0]} con la foto adjunta`);
      }
    }
  }

  // 2. Honeypot: 201 sin enviar nada.
  {
    const nombre = 'POST con honeypot → 201 sin .eml';
    const antes = listarEml(dataDir).length;
    const res = await post(formularioHoneypot());
    await res.body?.cancel();
    const nuevos = listarEml(dataDir).length - antes;
    if (res.status !== 201) paso(nombre, false, comun(res.status, 201));
    else if (nuevos !== 0) paso(nombre, false, `201, pero se han generado ${nuevos} .eml`);
    else paso(nombre, true, '201 y ningún .eml nuevo');
  }

  // 3. Teléfono inválido: 400 con error de validación en telefono.
  {
    const nombre = 'POST con teléfono 123 → 400 validación en telefono';
    const res = await post(formularioTelefonoMalo());
    const cuerpo = await json(res);
    const campos = cuerpo?.campos as Record<string, unknown> | undefined;
    if (res.status !== 400) paso(nombre, false, comun(res.status, 400));
    else if (cuerpo?.error !== 'validacion') paso(nombre, false, '400, pero error no es «validacion»');
    else if (!campos || !('telefono' in campos)) paso(nombre, false, '400, pero campos.telefono no viene');
    else paso(nombre, true, '400 con campos.telefono');
  }

  // 4. GET no está permitido (no cuenta contra el límite).
  {
    const nombre = 'GET /api/contacto → sin 2xx';
    const res = await fetchFn(url, { method: 'GET' });
    await res.body?.cancel();
    if (res.status >= 200 && res.status < 300) paso(nombre, false, `llegó ${res.status}; GET no debe responder 2xx`);
    else paso(nombre, true, `${res.status}`);
  }
}

function contiene(haystack: Uint8Array, needle: Uint8Array): boolean {
  outer: for (let i = 0; i + needle.length <= haystack.length; i++) {
    for (let j = 0; j < needle.length; j++) if (haystack[i + j] !== needle[j]) continue outer;
    return true;
  }
  return false;
}

/**
 * true si el .eml trae un adjunto (Content-Disposition: attachment, filename .png, Content-Type image/png)
 * cuyo contenido base64 decodificado contiene PNG_MINIMO.
 */
export function emlTieneFotoPng(contenido: string): boolean {
  const texto = contenido.replace(/\r\n/g, '\n');
  // Cada parte MIME empieza tras una línea de frontera «--...»; cortamos por ellas.
  const partes = texto.split(/^--.*$/m);
  return partes.some((parte) => {
    const limpia = parte.replace(/^\n/, '');
    const corte = limpia.indexOf('\n\n');
    if (corte < 0) return false;
    const cabeceras = limpia.slice(0, corte).replace(/\n[ \t]+/g, ' ').toLowerCase();
    const cuerpo = limpia.slice(corte + 2);
    if (!/^content-disposition:\s*attachment\b/m.test(cabeceras)) return false;
    if (!/filename\*?=\s*"?[^"\n;]*\.png\b/.test(cabeceras)) return false;
    if (!/^content-type:\s*image\/png\b/m.test(cabeceras)) return false;
    if (!/^content-transfer-encoding:\s*base64\b/m.test(cabeceras)) return false;
    const bytes = new Uint8Array(Buffer.from(cuerpo.replace(/[^A-Za-z0-9+/=]/g, ''), 'base64'));
    return contiene(bytes, PNG_MINIMO);
  });
}
