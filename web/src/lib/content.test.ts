import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cargarNegocio, contentDir } from './content.js';

const original = () => JSON.parse(readFileSync(join(contentDir(), 'negocio.json'), 'utf8'));

describe('content.ts', () => {
  const dirs: string[] = [];
  const conNegocio = (data: unknown) => {
    const dir = mkdtempSync(join(tmpdir(), 'contenido-'));
    dirs.push(dir);
    writeFileSync(join(dir, 'negocio.json'), JSON.stringify(data));
    process.env.CONTENT_DIR = dir;
  };
  afterEach(() => {
    delete process.env.CONTENT_DIR;
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });

  it('el contenido real valida y teléfono y WhatsApp llevan el mismo número de ejemplo sin confirmar', () => {
    const n = cargarNegocio();
    expect(n.telefono.valor).toBeTruthy();
    expect(n.whatsapp.valor).toBe(n.telefono.valor);
    expect(n.telefono.confirmado).toBe(false);
    expect(n.anios.confirmado).toBe(false);
    expect(n.garantia.anios.confirmado).toBe(false);
    expect(n.plazos.reparacion.confirmado).toBe(false);
    expect(n.analitica.ga4_id).toBeNull();
  });

  it('un campo mal tipado lanza un error que dice el fichero y el campo', () => {
    const data = original();
    data.anios.valor = 'diez';
    conNegocio(data);
    expect(() => cargarNegocio()).toThrow(/negocio\.json.*anios\.valor/s);
  });

  it('un dato sin `confirmado` también falla', () => {
    const data = original();
    delete data.plazos.reparacion.confirmado;
    conNegocio(data);
    expect(() => cargarNegocio()).toThrow(/negocio\.json.*plazos\.reparacion\.confirmado/s);
  });

  it('se encuentra web/content tanto desde la raíz como desde web/', () => {
    expect(contentDir().replace(/\\/g, '/')).toMatch(/web\/content$/);
  });
});
