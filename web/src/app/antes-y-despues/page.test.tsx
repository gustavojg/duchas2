import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NAV } from '../../config';
import { cargarGaleria, cargarNegocio, cargarServicios } from '../../lib/content';
import { PAGES } from '../../lib/site';
import { AntesYDespues, metadata } from './page';

const pares = cargarGaleria();
const servicios = cargarServicios();
const negocio = cargarNegocio();

const html = renderToStaticMarkup(<AntesYDespues pares={pares} servicios={servicios} negocio={negocio} />);
const sinScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
const textoPlano = sinScripts.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
/** Astryx (AspectRatio) pinta variables CSS internas en `style`; eso no es estilo propio. */
const sinVariablesAstryx = (s: string) => s.replace(/ style="(?:--[\w-]+:[\w.\s-]+;?)+"/g, '');

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

  it('lleva el filtro con «Todos» y el nombre de platos-de-ducha de servicios.json', () => {
    const platos = servicios.find((s) => s.slug === 'platos-de-ducha');
    expect(platos).toBeDefined();
    expect(html).toContain('Filtrar por servicio');
    expect(html).toContain('Todos');
    expect(html).toContain(platos!.nombre);
  });

  it('el botón de WhatsApp «Manda la foto del tuyo» si hay número', () => {
    if (negocio.whatsapp.valor) {
      expect(html).toContain('Manda la foto del tuyo');
      expect(html).toMatch(/href="https:\/\/wa\.me\/\d+\?text=/);
    }
  });

  it('sin pendientes, marcadores ni estilos sueltos', () => {
    expect(textoPlano).not.toContain('PENDIENTE');
    expect(textoPlano).not.toContain('{');
    expect(sinVariablesAstryx(html)).not.toContain('style=');
    expect(html).not.toContain('<style');
  });

  it('metadata con title «Antes y después…» y description', () => {
    expect(String(metadata.title)).toMatch(/^Antes y después/);
    expect(metadata.description).toBeTruthy();
    expect(metadata.alternates).toBeUndefined();
  });

  it('PAGES (sitemap) y NAV incluyen la página', () => {
    expect(PAGES).toContain('/antes-y-despues/');
    expect(NAV.map((n) => n.href)).toContain('/antes-y-despues/');
  });
});
