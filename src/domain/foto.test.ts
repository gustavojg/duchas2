import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { borrarFoto, detectarFoto, guardarFoto } from './foto.js';

const bytes = (...partes: (number[] | string)[]) =>
  new Uint8Array(partes.flatMap((p) => (typeof p === 'string' ? [...Buffer.from(p, 'latin1')] : p)));

const JPEG = bytes([0xff, 0xd8, 0xff, 0xe0, 0, 0x10], 'JFIF');
const PNG = bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d], 'IHDR');
const WEBP = bytes('RIFF', [0x24, 0, 0, 0], 'WEBPVP8 ');
const heif = (marca: string) => bytes([0, 0, 0, 0x18], 'ftyp', marca, [0, 0, 0, 0], 'mif1heic');

describe('detectarFoto()', () => {
  it('reconoce JPEG, PNG, WebP y HEIC por sus bytes', () => {
    expect(detectarFoto(JPEG)).toEqual({ mime: 'image/jpeg', ext: 'jpg' });
    expect(detectarFoto(PNG)).toEqual({ mime: 'image/png', ext: 'png' });
    expect(detectarFoto(WEBP)).toEqual({ mime: 'image/webp', ext: 'webp' });
    for (const m of ['heic', 'heix', 'hevc', 'mif1', 'msf1']) {
      expect(detectarFoto(heif(m)), m).toMatchObject({ ext: 'heic' });
    }
    expect(detectarFoto(heif('heic'))?.mime).toBe('image/heic');
  });

  it('rechaza lo que no es una foto aunque se llame .jpg', () => {
    expect(detectarFoto(bytes('%PDF-1.7\n'))).toBeNull();
    expect(detectarFoto(bytes('RIFF', [0, 0, 0, 0], 'WAVE'))).toBeNull();
    expect(detectarFoto(bytes([0, 0, 0, 0x18], 'ftyp', 'isom'))).toBeNull();
    expect(detectarFoto(new Uint8Array())).toBeNull();
    expect(detectarFoto(bytes([0xff, 0xd8]))).toBeNull();
  });
});

describe('guardarFoto() y borrarFoto()', () => {
  it('escribe DATA_DIR/fotos/<id>.<ext>, la borra y tolera que ya no exista', () => {
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'data-'));
    const fichero = guardarFoto(dataDir, 'abc', JPEG, 'jpg');
    expect(fichero).toBe('abc.jpg');
    const ruta = path.join(dataDir, 'fotos', 'abc.jpg');
    expect(new Uint8Array(fs.readFileSync(ruta))).toEqual(JPEG);
    borrarFoto(dataDir, fichero);
    expect(fs.existsSync(ruta)).toBe(false);
    expect(() => borrarFoto(dataDir, fichero)).not.toThrow();
  });

  it('borrarFoto no sale de DATA_DIR/fotos', () => {
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'data-'));
    fs.writeFileSync(path.join(dataDir, 'app.db'), 'x');
    borrarFoto(dataDir, '../app.db');
    expect(fs.existsSync(path.join(dataDir, 'app.db'))).toBe(true);
  });
});
