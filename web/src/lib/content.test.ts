import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  cargarComparativa,
  cargarFaq,
  cargarGaleria,
  cargarNegocio,
  cargarPasos,
  cargarResenas,
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

    const rutasMalas = ['//evil.com/', 'javascript:x', 'javascript:alert(1)//', 'http://evil.com/', '/\\evil.com/'];

    it.each(rutasMalas)('la ruta %s falla con fichero y campo', (ruta) => {
      const data = leer('servicios.json');
      data[4].ruta = ruta;
      conServicios(data);
      expect(() => cargarServicios()).toThrow(/servicios\.json.*4\.ruta/s);
    });

    // El tipo 'empresas' no tiene ruta fija: aquí solo rutaSchema protege contra «//» y esquemas.
    it.each(rutasMalas)('la ruta %s falla también en el servicio de empresas', (ruta) => {
      const data = leer('servicios.json');
      data[9].ruta = ruta;
      conServicios(data);
      expect(() => cargarServicios()).toThrow(/servicios\.json.*9\.ruta/s);
    });

    it('una ruta válida sigue validando', () => {
      const data = leer('servicios.json');
      data[4].ruta = '/servicios/azulejos/';
      data[9].ruta = '/hoteles-y-comunidades/';
      conServicios(data);
      expect(() => cargarServicios()).not.toThrow();
    });
  });
});

describe('galería, FAQ y reseñas', () => {
  const dirs: string[] = [];
  const real = (f: string) => JSON.parse(readFileSync(join(contentDir(), f), 'utf8'));
  /** CONTENT_DIR temporal con negocio.json (lo exige contentDir()) y el fichero `f` con `data`. */
  const conFichero = (f: string, data: unknown) => {
    const negocio = real('negocio.json');
    const dir = mkdtempSync(join(tmpdir(), 'contenido-'));
    dirs.push(dir);
    writeFileSync(join(dir, 'negocio.json'), JSON.stringify(negocio));
    writeFileSync(join(dir, f), JSON.stringify(data));
    process.env.CONTENT_DIR = dir;
  };
  afterEach(() => {
    delete process.env.CONTENT_DIR;
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });

  it('el contenido real valida: reseñas vacías, ≥ 15 preguntas y entre 4 y 6 en portada', () => {
    expect(cargarResenas()).toEqual([]);
    const faq = cargarFaq();
    const preguntas = faq.temas.flatMap((t) => t.preguntas);
    expect(preguntas.length).toBeGreaterThanOrEqual(15);
    const enPortada = preguntas.filter((p) => p.en_portada).length;
    expect(enPortada).toBeGreaterThanOrEqual(4);
    expect(enPortada).toBeLessThanOrEqual(6);
    const galeria = cargarGaleria();
    expect(galeria).toHaveLength(4);
    for (const par of galeria) expect(par.servicio).toBe('platos-de-ducha');
  });

  it('faq.json con 7 preguntas en portada lanza', () => {
    const faq = real('faq.json');
    let n = 0;
    for (const t of faq.temas) for (const p of t.preguntas) p.en_portada = n++ < 7;
    conFichero('faq.json', faq);
    expect(() => cargarFaq()).toThrow(/faq\.json/);
  });

  it('una respuesta con un plazo literal («24 h») lanza', () => {
    const faq = real('faq.json');
    faq.temas[0].preguntas[0].r = 'Te lo arreglamos en 24 h.';
    conFichero('faq.json', faq);
    expect(() => cargarFaq()).toThrow(/faq\.json.*r/s);
  });

  it('galeria.json solo admite WebP de /fotos y exige fotos si no hay hueco', () => {
    const g = real('galeria.json');
    g[0].antes = '/fotos/x.jpg';
    conFichero('galeria.json', g);
    expect(() => cargarGaleria()).toThrow(/galeria\.json.*antes/s);

    const g2 = real('galeria.json');
    delete g2[0].hueco;
    g2[0].antes = null;
    g2[0].despues = '/fotos/despues.webp';
    conFichero('galeria.json', g2);
    expect(() => cargarGaleria()).toThrow(/galeria\.json.*antes/s);
  });

  it('resenas.json con nota 6 lanza', () => {
    conFichero('resenas.json', [{ autor: 'Ana', nota: 6, texto: 'Muy bien', fecha: '2026-01-10', fuente: 'Google' }]);
    expect(() => cargarResenas()).toThrow(/resenas\.json.*nota/s);
  });
});
