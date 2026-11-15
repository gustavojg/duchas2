import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { rutaGenerada } from './paginas.ts';

describe('rutaGenerada', () => {
  const app = mkdtempSync(join(tmpdir(), 'paginas-'));
  const pagina = (...seg: string[]) => {
    mkdirSync(join(app, ...seg), { recursive: true });
    writeFileSync(join(app, ...seg, 'page.tsx'), 'export default function P() { return null; }\n');
  };
  pagina();
  pagina('zonas');
  pagina('servicios', '[slug]');
  pagina('(grupo)', 'x');
  // Un directorio sin page.tsx no genera página.
  mkdirSync(join(app, 'platos-de-ducha'), { recursive: true });
  writeFileSync(join(app, 'platos-de-ducha', 'layout.tsx'), '');
  afterAll(() => rmSync(app, { recursive: true, force: true }));

  it.each(['/', '/zonas/', '/servicios/azulejos/', '/x/'])('%s tiene página', (ruta) => {
    expect(rutaGenerada(ruta, app)).toBe(true);
  });

  it.each(['/platos-de-ducha/', '/servicios/', '/zonas/otra/', '/servicios/a/b/'])('%s no tiene página', (ruta) => {
    expect(rutaGenerada(ruta, app)).toBe(false);
  });

  it('normaliza la ruta: barra final, sin query ni hash', () => {
    expect(rutaGenerada('/zonas', app)).toBe(true);
    expect(rutaGenerada('/zonas/?a=1', app)).toBe(true);
    expect(rutaGenerada('/zonas/#mapa', app)).toBe(true);
    expect(rutaGenerada('', app)).toBe(true);
  });

  it('con el appDir real, /zonas/ tiene página y /no-existe/ no', () => {
    expect(rutaGenerada('/zonas/')).toBe(true);
    expect(rutaGenerada('/no-existe/')).toBe(false);
  });
});
