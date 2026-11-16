import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NAV } from '../../config';
import { cargarGaleria, cargarNegocio, cargarServicios, type Negocio, type ParGaleria } from '../../lib/content';
import { APP_NAME, canonicalUrl, PAGES } from '../../lib/site';
import { metadataServicio } from '../servicios/[slug]/page';
import {
  AntesYDespues,
  DESCRIPCION,
  generateMetadata,
  PaginaAntesYDespues,
  type PaginaAntesYDespuesProps,
  TITULO,
} from './page';

const pares = cargarGaleria();
const servicios = cargarServicios();
const negocio = cargarNegocio();

const render = (p: ParGaleria[], n: Negocio = negocio) =>
  renderToStaticMarkup(<AntesYDespues pares={p} servicios={servicios} negocio={n} />);
const plano = (h: string) =>
  h
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

const html = render(pares);
const textoPlano = plano(html);
/** Astryx (AspectRatio) pinta variables CSS internas en `style`; eso no es estilo propio. */
const sinVariablesAstryx = (s: string) => s.replace(/ style="(?:--[\w-]+:[\w.\s-]+;?)+"/g, '');

const conFoto: ParGaleria = {
  ...pares[0],
  antes: '/galeria/antes-1.jpg',
  despues: '/galeria/despues-1.jpg',
  hueco: undefined,
} as ParGaleria;

describe('/antes-y-despues/', () => {
  it('tiene un solo H1 «Antes y después»', () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>(?:(?!<\/h1>).)*Antes y después/s);
  });

  it('pinta el hueco de cada par de galeria.json y la cinta «Ilustración» mientras no hay fotos', () => {
    expect(pares.length).toBeGreaterThan(0);
    for (const p of pares) if (p.hueco) expect(html).toContain(p.hueco);
    if (pares.some((p) => !p.antes || !p.despues)) expect(textoPlano.toUpperCase()).toContain('ILUSTRACIÓN');
  });

  it('con el contenido actual (sin fotos) avisa «Pronto, fotos reales…», ofrece mandar la foto y no pinta <img>', () => {
    expect(pares.some((p) => p.antes && p.despues)).toBe(false);
    expect(textoPlano).toContain('Pronto, fotos reales de este trabajo');
    if (negocio.whatsapp.valor) expect(textoPlano).toContain('Manda la foto del tuyo');
    expect(html).not.toContain('<img');
  });

  it('lleva el filtro con «Todos» y el nombre de platos-de-ducha de servicios.json', () => {
    const platos = servicios.find((s) => s.slug === 'platos-de-ducha');
    expect(platos).toBeDefined();
    expect(html).toContain('Filtrar por servicio');
    expect(html).toContain('Todos');
    expect(html).toContain(platos!.nombre);
  });

  it('el contenedor es más ancho que el de texto para la rejilla de dos columnas', () => {
    expect(html).toMatch(/class="[^"]*\bportada portada-galeria\b/);
  });

  it('el botón de WhatsApp «Manda la foto del tuyo» si hay número', () => {
    if (negocio.whatsapp.valor) {
      expect(html).toContain('Manda la foto del tuyo');
      expect(html).toMatch(/href="https:\/\/wa\.me\/\d+\?text=/);
    }
  });

  it('sin WhatsApp no pinta el botón', () => {
    const sin = render(pares, { ...negocio, whatsapp: { valor: null, confirmado: false } });
    expect(plano(sin)).not.toContain('Manda la foto del tuyo');
  });

  it('con un par con foto pinta las dos fotos y no el aviso', () => {
    const solo = render([conFoto]);
    expect(solo).toContain('src="/galeria/antes-1.jpg"');
    expect(solo).toContain('src="/galeria/despues-1.jpg"');
    expect(solo.match(/<img\b/g)).toHaveLength(2);
    expect(plano(solo)).not.toContain('Pronto, fotos reales de este trabajo');
    // Mezclado con los pares sin foto, siguen siendo solo las dos <img> del par con foto.
    expect(render([conFoto, ...pares]).match(/<img\b/g)).toHaveLength(2);
  });

  it('sin pendientes, marcadores ni estilos sueltos', () => {
    expect(html).not.toContain('PENDIENTE');
    expect(html).not.toContain('{{');
    expect(textoPlano).not.toContain('{');
    expect(sinVariablesAstryx(html)).not.toContain('style=');
    expect(html).not.toContain('<style');
  });

  it('metadata con title «Antes y después · APP_NAME» y description', () => {
    const metadata = generateMetadata();
    expect(String(metadata.title)).toMatch(/^Antes y después/);
    expect(metadata.title).toBe(`Antes y después · ${APP_NAME}`);
    expect(metadata.description).toBeTruthy();
  });

  it('metadata lleva su canonical: url_base + /antes-y-despues/', () => {
    expect(generateMetadata().alternates?.canonical).toBe(canonicalUrl(cargarNegocio().url_base, '/antes-y-despues/'));
  });

  it('PAGES (sitemap) y NAV incluyen la página', () => {
    expect(PAGES).toContain('/antes-y-despues/');
    expect(NAV.map((n) => n.href)).toContain('/antes-y-despues/');
  });
});

const base: PaginaAntesYDespuesProps = { negocio, servicios, galeria: cargarGaleria() };
const pinta = (otro: Partial<PaginaAntesYDespuesProps> = {}) => renderToStaticMarkup(<PaginaAntesYDespues {...base} {...otro} />);
const htmlPagina = pinta();

describe('/antes-y-despues/ (PaginaAntesYDespues)', () => {
  it('tiene un solo H1 «Antes y después de nuestros trabajos»', () => {
    expect(htmlPagina.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(/<h1[^>]*>((?:(?!<\/h1>).)*)<\/h1>/s.exec(htmlPagina)![1]).toBe('Antes y después de nuestros trabajos');
  });

  it('metadata propia con canonical = url_base + /antes-y-despues/', () => {
    const meta = generateMetadata();
    expect(meta.title).toBe(TITULO);
    expect(meta.description).toBe(DESCRIPCION);
    expect(meta.alternates?.canonical).toBe(`${negocio.url_base.replace(/\/+$/, '')}/antes-y-despues/`);
  });

  it('el título y la descripción no repiten los de otra página', () => {
    for (const s of servicios) {
      const m = metadataServicio(servicios, s.slug, negocio.url_base);
      expect(m.title).not.toBe(TITULO);
      expect(m.description).not.toBe(DESCRIPCION);
    }
  });

  it('migas Inicio › Antes y después, galería y cierre con WhatsApp en #cta-hero', () => {
    expect(htmlPagina).toContain('aria-label="Migas de pan"');
    expect(htmlPagina).toContain('aria-label="Filtrar por servicio"');
    expect((htmlPagina.match(/data-par=/g) ?? []).length).toBe(base.galeria.length);
    expect(htmlPagina.slice(htmlPagina.indexOf('id="cta-hero"'))).toContain('wa.me');
    expect(htmlPagina).toContain('"@type":"BreadcrumbList"');
    expect(htmlPagina).not.toContain('PENDIENTE');
    expect(htmlPagina).not.toContain('{{');
  });

  it('sin número de WhatsApp no pinta el botón', () => {
    const sin: Negocio = { ...negocio, whatsapp: { valor: null, confirmado: false } };
    expect(pinta({ negocio: sin })).not.toContain('wa.me');
  });
});
