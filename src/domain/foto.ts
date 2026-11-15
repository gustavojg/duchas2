import fs from 'node:fs';
import path from 'node:path';

export type ExtFoto = 'jpg' | 'png' | 'webp' | 'heic';
export interface TipoFoto { mime: string; ext: ExtFoto }

const MARCAS_HEIF = new Set(['heic', 'heix', 'hevc', 'mif1', 'msf1']);

const empieza = (b: Uint8Array, firma: number[], desde = 0) =>
  b.length >= desde + firma.length && firma.every((x, i) => b[desde + i] === x);
const ascii = (b: Uint8Array, desde: number, hasta: number) =>
  b.length >= hasta ? String.fromCharCode(...b.subarray(desde, hasta)) : '';

/**
 * Tipo de la foto por sus bytes mágicos (nunca por Content-Type ni extensión): JPEG, PNG, WebP o HEIC/HEIF.
 * Devuelve null si no es ninguno.
 */
export function detectarFoto(bytes: Uint8Array): TipoFoto | null {
  if (empieza(bytes, [0xff, 0xd8, 0xff])) return { mime: 'image/jpeg', ext: 'jpg' };
  if (empieza(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: 'image/png', ext: 'png' };
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
  if (ascii(bytes, 4, 8) === 'ftyp') {
    const marca = ascii(bytes, 8, 12);
    if (MARCAS_HEIF.has(marca)) {
      return { mime: marca === 'mif1' || marca === 'msf1' ? 'image/heif' : 'image/heic', ext: 'heic' };
    }
  }
  return null;
}

const dirFotos = (dataDir: string) => path.join(dataDir, 'fotos');

/** Escribe DATA_DIR/fotos/<id>.<ext> (fuera de web/out: nunca se sirve) y devuelve solo el nombre del fichero. */
export function guardarFoto(dataDir: string, id: string, bytes: Uint8Array, ext: ExtFoto): string {
  const fichero = path.basename(`${id}.${ext}`);
  fs.mkdirSync(dirFotos(dataDir), { recursive: true });
  fs.writeFileSync(path.join(dirFotos(dataDir), fichero), bytes);
  return fichero;
}

/** Borra DATA_DIR/fotos/<fichero>; basename evita salir del directorio y un fichero ausente no es error. */
export function borrarFoto(dataDir: string, fichero: string): void {
  try {
    fs.unlinkSync(path.join(dirFotos(dataDir), path.basename(fichero)));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }
}
