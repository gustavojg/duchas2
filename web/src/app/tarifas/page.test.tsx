import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { APP_NAME } from '../../config';
import { serviciosOrdenados } from '../../lib/catalogo';
import { cargarNegocio, cargarServicios, type Servicio } from '../../lib/content';
import { rutaGenerada } from '../../lib/paginas';
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
const serviciosOrdenadosResumen = () => serviciosOrdenados(servicios).map((s) => s.resumen);

/** Reglas de globals.css cuyo selector menciona `tabla-tarifas` (incluidas las de dentro de @media). */
const cssTarifas = () => {
  const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
  const ini = css.indexOf('.tabla-tarifas');
  const fin = css.indexOf('\n/*', ini);
  return css.slice(ini, fin);
};
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

  it('tabla legible: clase tabla-tarifas, 3 columnas marcadas y cada resumen una sola vez (en «Incluye»)', () => {
    expect(html).toMatch(/<table[^>]*class="(?:[^"]* )?tabla-tarifas[ "]/);
    const th = [...html.matchAll(/<th\b[^>]*class="([^"]*)"/g)].map((m) => m[1]);
    expect(th).toHaveLength(3);
    expect(th[0]).toMatch(/\btabla-tarifas-trabajo\b/);
    expect(th[1]).toMatch(/\btabla-tarifas-desde\b/);
    expect(th[2]).toMatch(/\btabla-tarifas-incluye\b/);
    const filas = servicios.length;
    for (const c of ['trabajo', 'desde', 'incluye'])
      expect(html.match(new RegExp(`<td\\b[^>]*class="[^"]*\\btabla-tarifas-${c}\\b`, 'g'))).toHaveLength(filas);
    // En móvil las filas se apilan por CSS: ya no hay resumen duplicado en «Trabajo».
    expect(html).not.toContain('tabla-tarifas-resumen-movil');
    const t = textoPlano(html);
    for (const s of servicios) expect(t.split(s.resumen)).toHaveLength(2);
    const incluye = [...html.matchAll(/<td\b[^>]*class="[^"]*\btabla-tarifas-incluye\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    serviciosOrdenadosResumen().forEach((r, i) => expect(incluye[i]).toContain(r));
    // Sin style= propio: los únicos estilos en línea son los que pinta Astryx en sus propios elementos.
    for (const m of sinScripts(html).matchAll(/<[a-z]+\b([^>]*)\sstyle="[^"]*"/g)) expect(m[1]).toMatch(/class="astryx-/);
  });

  it('CSS de la tabla: ocupa el contenedor, anula el recorte de Astryx y apila filas en móvil', () => {
    const css = cssTarifas();
    expect(css).toMatch(/\.tabla-tarifas\s*\{[^}]*inline-size:\s*100%/);
    // «Desde» nunca con ancho fijo (recortaba «Pide presupuesto gratuito»): solo mínimo.
    expect(css).not.toMatch(/\.tabla-tarifas-desde\s*\{[^}]*(?<![-a-z])inline-size:/);
    expect(css).toMatch(/\.tabla-tarifas-desde\s*\{[^}]*min-inline-size:/);
    // Astryx pone en th/td max-width:0, overflow:hidden, text-overflow:ellipsis y nowrap: se anulan.
    for (const d of [/max-inline-size:\s*none/, /overflow:\s*visible/, /text-overflow:\s*clip/, /white-space:\s*normal/])
      expect(css).toMatch(d);
    const movil = css.slice(css.indexOf('@media (max-width: 40em)'));
    expect(movil).toMatch(/\.tabla-tarifas thead\s*\{[^}]*display:\s*none/);
    expect(movil).toMatch(/\.tabla-tarifas tr,\s*\.tabla-tarifas td\s*\{[^}]*display:\s*block/);
    expect(css).not.toMatch(/resumen-movil/);
    expect(css).not.toMatch(/\d(px|rem)\b|#[0-9a-f]{3,8}\b/i);
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

  it('cada trabajo enlaza a su ficha solo si el build genera esa página; si no, el nombre va sin enlace', () => {
    const trabajo = [...html.matchAll(/<td\b[^>]*class="[^"]*\btabla-tarifas-trabajo\b[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    const orden = serviciosOrdenados(servicios);
    expect(trabajo).toHaveLength(orden.length);
    orden.forEach((s, i) => {
      expect(textoPlano(trabajo[i])).toContain(s.nombre);
      expect(trabajo[i].includes(`href="${s.ruta}"`)).toBe(rutaGenerada(s.ruta));
      if (!rutaGenerada(s.ruta)) expect(trabajo[i]).not.toContain('<a');
    });
    for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) expect(rutaGenerada(m[1]), `enlace roto: ${m[1]}`).toBe(true);
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
