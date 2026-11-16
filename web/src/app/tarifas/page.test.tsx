import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { APP_NAME } from '../../config';
import { cargarNegocio, cargarServicios, type Servicio } from '../../lib/content';
import { metadataPlatosDeDucha } from '../platos-de-ducha/page';
import { generateMetadata, MENSAJE_TARIFAS, metadataTarifas, PaginaTarifas } from './page';

const negocio = cargarNegocio();
const servicios = cargarServicios();
const pinta = (s: Servicio[] = servicios, modo: 'publico' | 'pendientes' = 'publico') =>
  renderToStaticMarkup(<PaginaTarifas negocio={negocio} servicios={s} modo={modo} />);
const sinScripts = (html: string) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
const textoPlano = (html: string) => sinScripts(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const jsonLd = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]) as Record<string, unknown>);

/** El primer servicio con precio confirmado de 80; el resto, sin confirmar. */
const conPrecio = (): Servicio[] =>
  servicios.map((s, i) => ({ ...s, precio_desde: i === 0 ? { valor: 80, confirmado: true } : { valor: null, confirmado: false } }));

const html = pinta();

describe('/tarifas/', () => {
  it('tiene un solo H1', () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>(?:(?!<\/h1>).)*Tarifas de reparación de platos de ducha y bañeras en Madrid/s);
  });

  it('una fila por servicio con nombre y resumen, en una tabla de 3 columnas', () => {
    expect(html).toMatch(/<table[\s>]/);
    expect(html.match(/<th[\s>]/g)).toHaveLength(3);
    for (const c of ['Trabajo', 'Desde', 'Incluye']) expect(html).toMatch(new RegExp(`<th[^>]*>(?:(?!</th>).)*${c}`, 's'));
    const t = textoPlano(html);
    for (const s of servicios) {
      expect(t).toContain(s.nombre);
      expect(t).toContain(s.resumen);
    }
  });

  it('tabla legible en móvil: clase tabla-tarifas, columnas marcadas y resumen como segunda línea solo en móvil', () => {
    expect(html).toMatch(/<table[^>]*class="(?:[^"]* )?tabla-tarifas[ "]/);
    const th = [...html.matchAll(/<th\b[^>]*class="([^"]*)"/g)].map((m) => m[1]);
    expect(th[0]).toMatch(/\btabla-tarifas-trabajo\b/);
    expect(th[1]).toMatch(/\btabla-tarifas-desde\b/);
    expect(th[2]).toMatch(/\btabla-tarifas-incluye\b/);
    const filas = servicios.length;
    expect(html.match(/<td\b[^>]*class="[^"]*\btabla-tarifas-incluye\b/g)).toHaveLength(filas);
    const moviles = [...html.matchAll(/<p\b[^>]*class="[^"]*\btabla-tarifas-resumen-movil\b[^"]*"[^>]*>([^<]*)<\/p>/g)].map((m) => m[1]);
    expect(moviles).toHaveLength(filas);
    // Cada resumen-móvil va dentro de la celda Trabajo, no en Incluye.
    const celdasTrabajo = [...html.matchAll(/<td\b[^>]*class="[^"]*\btabla-tarifas-trabajo\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    expect(celdasTrabajo).toHaveLength(filas);
    for (const c of celdasTrabajo) expect(c).toContain('tabla-tarifas-resumen-movil');
    // Sin style= propio: los únicos estilos en línea son los que pinta Astryx en sus propios elementos.
    for (const m of sinScripts(html).matchAll(/<[a-z]+\b([^>]*)\sstyle="[^"]*"/g)) expect(m[1]).toMatch(/class="astryx-/);
  });

  it('precio confirmado: «Desde 80 €»; sin confirmar: «Pide presupuesto gratuito»; nunca 0', () => {
    const t = textoPlano(pinta(conPrecio()));
    expect(t).toContain('Desde 80 €');
    expect(t).toContain('Pide presupuesto gratuito');
    expect(t).not.toContain('Desde 0');
    expect(t).not.toContain(' 0 €');
    const cero = servicios.map((s) => ({ ...s, precio_desde: { valor: 0, confirmado: true } }));
    expect(textoPlano(pinta(cero))).not.toMatch(/Desde 0|\b0 €/);
  });

  it('lleva la nota del precio orientativo', () => {
    expect(textoPlano(html)).toContain('Precio orientativo; el presupuesto final depende del daño');
  });

  it('dos enlaces de WhatsApp con el mensaje codificado: primario en la cabecera de la tabla y secundario al cierre', () => {
    const enlace = `https://wa.me/34600000000?text=${encodeURIComponent(MENSAJE_TARIFAS)}`;
    expect(html.split(enlace).length - 1).toBeGreaterThanOrEqual(2);
    const primarios = [...html.matchAll(/<a\b[^>]*data-variant="primary"[^>]*>/g)].map((m) => m[0]);
    expect(primarios).toHaveLength(1);
    // El primario va justo antes de la tabla.
    const antesTabla = html.split(/<table[\s>]/)[0];
    expect(antesTabla).toContain('data-variant="primary"');
    const trasTabla = html.split('</table>')[1];
    expect(trasTabla).toContain(enlace);
    expect(trasTabla).toContain('href="/platos-de-ducha/"');
  });

  it('migas visibles y JSON-LD BreadcrumbList parseable', () => {
    expect(html).toMatch(/<nav[^>]*aria-label="Migas de pan"/);
    const lds = jsonLd(html);
    expect(lds.map((l) => l['@type'])).toEqual(['BreadcrumbList']);
    const bc = lds[0] as { itemListElement: { name: string; item: string }[] };
    expect(bc.itemListElement.map((i) => i.name)).toEqual(['Inicio', 'Tarifas']);
    expect(bc.itemListElement[1].item).toMatch(/\/tarifas\/$/);
  });

  it('nada pendiente en público', () => {
    expect(sinScripts(html)).not.toContain('PENDIENTE');
    expect(sinScripts(html)).not.toContain('{{');
  });
});

describe('metadatos de /tarifas/', () => {
  it('canonical absoluto y title propio distinto del de platos de ducha', () => {
    const m = metadataTarifas('https://ejemplo.test');
    expect(m.alternates.canonical).toBe('https://ejemplo.test/tarifas/');
    expect(m.title).toBe(`Tarifas de reparación y esmaltado en Madrid · ${APP_NAME}`);
    const plato = metadataPlatosDeDucha(servicios, 'https://ejemplo.test');
    expect(m.title).not.toBe(plato.title);
    expect(m.description).not.toBe(plato.description);
    expect(m.description).toMatch(/presupuesto gratuito/i);
  });

  it('generateMetadata usa url_base de negocio.json', () => {
    expect(generateMetadata().alternates?.canonical).toBe(`${negocio.url_base.replace(/\/+$/, '')}/tarifas/`);
  });
});
