import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cargarFaq, cargarGaleria, cargarNegocio, cargarResenas, contentDir } from './content.ts';

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

  it('el contenido real valida: reseñas vacías, ≥ 17 preguntas y entre 4 y 6 en portada', () => {
    expect(cargarResenas()).toEqual([]);
    const faq = cargarFaq();
    const preguntas = faq.temas.flatMap((t) => t.preguntas);
    expect(preguntas.length).toBeGreaterThanOrEqual(17);
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
