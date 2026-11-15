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
