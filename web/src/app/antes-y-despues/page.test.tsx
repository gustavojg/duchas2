import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargarGaleria, cargarNegocio, cargarServicios, type Negocio } from '../../lib/content';
import { metadataServicio } from '../servicios/[slug]/page';
import { DESCRIPCION, generateMetadata, PaginaAntesYDespues, type PaginaAntesYDespuesProps, TITULO } from './page';

const negocio = cargarNegocio();
const servicios = cargarServicios();
const base: PaginaAntesYDespuesProps = { negocio, servicios, galeria: cargarGaleria() };
const pinta = (otro: Partial<PaginaAntesYDespuesProps> = {}) => renderToStaticMarkup(<PaginaAntesYDespues {...base} {...otro} />);
const html = pinta();

describe('/antes-y-despues/', () => {
  it('tiene un solo H1 «Antes y después de nuestros trabajos»', () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(/<h1[^>]*>((?:(?!<\/h1>).)*)<\/h1>/s.exec(html)![1]).toBe('Antes y después de nuestros trabajos');
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
    expect(html).toContain('aria-label="Migas de pan"');
    expect(html).toContain('aria-label="Filtrar por trabajo"');
    expect((html.match(/data-par=/g) ?? []).length).toBe(base.galeria.length);
    expect(html.slice(html.indexOf('id="cta-hero"'))).toContain('wa.me');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).not.toContain('PENDIENTE');
    expect(html).not.toContain('{{');
  });

  it('sin número de WhatsApp no pinta el botón', () => {
    const sin: Negocio = { ...negocio, whatsapp: { valor: null, confirmado: false } };
    expect(pinta({ negocio: sin })).not.toContain('wa.me');
  });
});
