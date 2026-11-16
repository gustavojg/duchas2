import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargarNegocio, cargarServicios, type ParGaleria } from '../lib/content';
import { GALERIA_VACIA } from '../lib/galeria';
import { GaleriaFiltrable, type GaleriaFiltrableProps } from './GaleriaFiltrable';

const servicios = cargarServicios();
const whatsapp = cargarNegocio().whatsapp.valor;
const mensaje = 'Hola, vengo de la galería. Os mando una foto del daño.';

const conFoto = (n: number): ParGaleria => ({
  servicio: 'azulejos',
  antes: `/fotos/azulejo-${n}-antes.webp`,
  despues: `/fotos/azulejo-${n}-despues.webp`,
  alt_antes: `Azulejo ${n} roto antes de repararlo`,
  alt_despues: `Azulejo ${n} reparado después`,
});
const sinFoto = (n: number): ParGaleria => ({
  servicio: 'mamparas',
  antes: null,
  despues: null,
  alt_antes: `Mampara ${n} antes`,
  alt_despues: `Mampara ${n} después`,
  hueco: `Mampara ${n} antes y después de repararla`,
});

const pinta = (otro: Partial<GaleriaFiltrableProps> = {}) =>
  renderToStaticMarkup(<GaleriaFiltrable servicios={servicios} pares={[]} whatsapp={whatsapp} mensaje={mensaje} {...otro} />);
const decodificar = (t: string) => t.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const textoPlano = (html: string) => decodificar(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const ctas = (html: string) => (html.match(/href="https:\/\/wa\.me\//g) ?? []).length;
const items = (html: string) => (html.match(/data-par=/g) ?? []).length;

describe('GaleriaFiltrable', () => {
  const siete = [conFoto(1), conFoto(2), sinFoto(3), conFoto(4), sinFoto(5), conFoto(6), conFoto(7)];

  it('con 7 pares salen los 7 y un solo CTA intermedio, tras el sexto', () => {
    const html = pinta({ pares: siete });
    expect(items(html)).toBe(7);
    expect(ctas(html)).toBe(1);
    const cta = html.indexOf('href="https://wa.me/');
    expect(cta).toBeGreaterThan(html.indexOf('Azulejo 6 roto'));
    expect(cta).toBeLessThan(html.indexOf('Azulejo 7 roto'));
    expect(html).toContain(`?text=${encodeURIComponent(mensaje)}`);
  });

  it('con 6 pares no hay CTA intermedio', () => {
    const html = pinta({ pares: siete.slice(0, 6) });
    expect(items(html)).toBe(6);
    expect(ctas(html)).toBe(0);
  });

  it('todo par con foto lleva <img> con alt no vacío; los pares sin foto muestran su hueco', () => {
    const html = pinta({ pares: siete });
    const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    expect(imgs).toHaveLength(10);
    for (const img of imgs) expect(img).toMatch(/\balt="[^"]+"/);
    expect(html).toContain('alt="Azulejo 1 roto antes de repararlo"');
    expect(html).toContain('alt="Azulejo 1 reparado después"');
    const t = textoPlano(html);
    expect(t).toContain('Mampara 3 antes y después de repararla');
    expect(t).toContain('Mampara 5 antes y después de repararla');
  });

  it('encima de cada par va el nombre de su servicio', () => {
    const t = textoPlano(pinta({ pares: [conFoto(1), sinFoto(2)] }));
    expect(t).toContain('Esmaltado de azulejos');
    expect(t).toContain('Reparación de mamparas');
  });

  it('sin pares sale el texto de galería vacía y el WhatsApp', () => {
    const html = pinta({ pares: [] });
    expect(textoPlano(html)).toContain(GALERIA_VACIA);
    expect(ctas(html)).toBe(1);
    expect(items(html)).toBe(0);
  });

  it('sin número de WhatsApp no pinta botones', () => {
    expect(ctas(pinta({ pares: [], whatsapp: null }))).toBe(0);
    expect(ctas(pinta({ pares: siete, whatsapp: null }))).toBe(0);
  });

  it('el filtro ofrece «Todos» y los servicios que no son de empresas, con «Todos» elegido', () => {
    const html = pinta({ pares: siete });
    const radios = [...html.matchAll(/<[^>]*role="radio"[^>]*>/g)].map((m) => m[0]);
    const esperadas = ['Todos', ...servicios.filter((s) => s.tipo !== 'empresas').sort((a, b) => a.orden - b.orden).map((s) => s.nombre)];
    expect(radios).toHaveLength(esperadas.length);
    const t = textoPlano(html);
    for (const e of esperadas) expect(t).toContain(e);
    expect(t).not.toContain('Hoteles y comunidades');
    expect(radios[0]).toContain('aria-checked="true"');
  });
});
