import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  cargarComparativa,
  cargarNegocio,
  cargarPasos,
  cargarServicios,
  cargarZonas,
  contentDir,
} from './content.ts';

const leer = (f: string) => JSON.parse(readFileSync(join(contentDir(), f), 'utf8'));
const original = () => leer('negocio.json');

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

  describe('servicios, pasos, comparativa y zonas', () => {
    const conServicios = (data: unknown) => {
      const dir = mkdtempSync(join(tmpdir(), 'contenido-'));
      dirs.push(dir);
      writeFileSync(join(dir, 'servicios.json'), JSON.stringify(data));
      process.env.CONTENT_DIR = dir;
    };

    it('los cuatro JSON reales validan', () => {
      const s = cargarServicios();
      expect(s).toHaveLength(10);
      expect(s[0]).toMatchObject({ nombre: 'Reparación y esmaltado de platos de ducha', tipo: 'principal', ruta: '/platos-de-ducha/' });
      expect(s[9].tipo).toBe('empresas');
      for (const x of s.slice(1, 9)) {
        expect(x.tipo).toBe('servicio');
        expect(x.ruta).toBe(`/servicios/${x.slug}/`);
      }
      for (const x of s) expect(x.precio_desde.confirmado).toBe(false);
      expect(s[0].whatsapp_mensaje).toMatch(/plato de ducha/);

      const p = cargarPasos();
      expect(p.map((x) => x.numero)).toEqual([1, 2, 3, 4]);

      const c = cargarComparativa();
      expect(c.filas.map((f) => f.id)).toEqual(['coste', 'tiempo', 'obra']);
      expect(c.filas[0].cambiar.confirmado).toBe(false);

      const z = cargarZonas();
      expect(z.madrid_capital).toHaveLength(21);
      expect(z.municipios.length).toBeGreaterThan(0);
    });

    it('un `relacionados` a un slug inexistente falla con fichero y campo', () => {
      const data = leer('servicios.json');
      data[1].relacionados = ['no-existe'];
      conServicios(data);
      expect(() => cargarServicios()).toThrow(/servicios\.json.*1\.relacionados/s);
    });

    it('un slug repetido falla con fichero y campo', () => {
      const data = leer('servicios.json');
      data[2].slug = data[1].slug;
      data[2].ruta = `/servicios/${data[1].slug}/`;
      conServicios(data);
      expect(() => cargarServicios()).toThrow(/servicios\.json.*2\.slug/s);
    });

    it('un `imagen_tarjeta` desconocido falla con fichero y campo', () => {
      const data = leer('servicios.json');
      data[3].imagen_tarjeta = 'foto-rara';
      conServicios(data);
      expect(() => cargarServicios()).toThrow(/servicios\.json.*3\.imagen_tarjeta/s);
    });

    it('una ruta de servicio que no es /servicios/<slug>/ falla', () => {
      const data = leer('servicios.json');
      data[4].ruta = '/otra/';
      conServicios(data);
      expect(() => cargarServicios()).toThrow(/servicios\.json.*4\.ruta/s);
    });
  });
});
