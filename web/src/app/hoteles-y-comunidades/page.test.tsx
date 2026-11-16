import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargarNegocio, cargarServicios, type Negocio, type ParGaleria, type Referencia } from '../../lib/content';
import { MENSAJE_PORTADA } from '../../lib/whatsapp';
import { generateMetadata, PaginaHoteles, type PaginaHotelesProps } from './page';

const negocio = cargarNegocio();
const servicios = cargarServicios();
const empresas = servicios.find((s) => s.tipo === 'empresas')!;
const base: PaginaHotelesProps = { negocio, servicios, referencias: [], galeria: [], modo: 'publico' };
const pinta = (otro: Partial<PaginaHotelesProps> = {}) => renderToStaticMarkup(<PaginaHoteles {...base} {...otro} />);
const decodificar = (t: string) => t.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const textoPlano = (html: string) =>
  decodificar(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const h2s = (html: string) => [...html.matchAll(/<h2[^>]*>((?:(?!<\/h2>).)*)<\/h2>/gs)].map((m) => decodificar(m[1].replace(/<[^>]+>/g, '')));
const conGarantia = (garantia: Negocio['garantia']['anios']): Negocio => ({ ...negocio, garantia: { ...negocio.garantia, anios: garantia } });

const html = pinta();
const texto = textoPlano(html);

describe('/hoteles-y-comunidades/', () => {
  it('el único H1 es «Renovamos bañeras de hotel sin cerrar habitaciones»', () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(decodificar(/<h1[^>]*>((?:(?!<\/h1>).)*)<\/h1>/s.exec(html)![1])).toBe('Renovamos bañeras de hotel sin cerrar habitaciones');
  });

  it('migas, CTA del hero y pasos de cómo trabajamos con hoteles', () => {
    expect(html).toContain('aria-label="Migas de pan"');
    const hero = html.slice(html.indexOf('id="cta-hero"'));
    expect(hero).toContain('wa.me');
    expect(texto).toContain('Llamar');
    expect(h2s(html)).toContain('Cómo trabajamos con hoteles');
    expect(html.match(/PASO \d+/g)).toHaveLength(empresas.como.length);
    for (const paso of empresas.como) expect(texto).toContain(paso);
  });

  it('sin referencias no hay sección «Referencias»; con una, su nombre y su texto', () => {
    expect(html).not.toContain('Referencias');
    const ref: Referencia = { nombre: 'Hotel Ejemplo Centro', tipo: 'Hotel', texto: 'Renovamos las bañeras de la planta tercera.' };
    const con = pinta({ referencias: [ref] });
    expect(h2s(con)).toContain('Referencias');
    const t = textoPlano(con);
    expect(t).toContain(ref.nombre);
    expect(t).toContain(ref.tipo);
    expect(t).toContain(ref.texto);
  });

  it('garantía sin confirmar: «Garantía por escrito» sin cifra; confirmada a 3: «Garantía por escrito de 3 años»', () => {
    const sin = textoPlano(pinta({ negocio: conGarantia({ valor: 3, confirmado: false }) }));
    expect(sin).toContain('Garantía por escrito');
    expect(sin).not.toMatch(/Garantía por escrito de/);
    expect(textoPlano(pinta({ negocio: conGarantia({ valor: 3, confirmado: true }) }))).toContain('Garantía por escrito de 3 años');
  });

  it('el WhatsApp lleva el mensaje del servicio de empresas, no el de portada', () => {
    expect(empresas.whatsapp_mensaje).toMatch(/hotel|comunidad/i);
    expect(html).toContain(`?text=${encodeURIComponent(empresas.whatsapp_mensaje)}`);
    expect(html).not.toContain(`?text=${encodeURIComponent(MENSAJE_PORTADA)}`);
  });

  it('cierre «Cuéntanos cuántas bañeras y cuándo» y FAQ del servicio', () => {
    expect(h2s(html)).toContain('Cuéntanos cuántas bañeras y cuándo');
    for (const q of empresas.faqs) expect(texto).toContain(q.p);
  });

  it('antes y después: hueco sin pares; con un par del servicio, su alt', () => {
    expect(h2s(html)).toContain('Antes y después');
    expect(texto).toContain(`Foto de ${empresas.nombre} antes y después`);
    const par: ParGaleria = {
      servicio: empresas.slug,
      antes: '/fotos/hotel-antes.webp',
      despues: '/fotos/hotel-despues.webp',
      alt_antes: 'Bañera de hotel gastada antes',
      alt_despues: 'Bañera de hotel esmaltada después',
    };
    expect(pinta({ galeria: [par] })).toContain(par.alt_antes);
  });

  it('JSON-LD Service y BreadcrumbList; sin «PENDIENTE» ni «{{»', () => {
    expect(html).toContain('"@type":"Service"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).not.toContain('PENDIENTE');
    expect(html).not.toContain('{{');
  });

  it('metadata del servicio de empresas con canonical propio', () => {
    const meta = generateMetadata();
    expect(meta.title).toBe(empresas.seo.title);
    expect(meta.description).toBe(empresas.seo.description);
    expect(meta.alternates?.canonical).toBe(`${negocio.url_base.replace(/\/+$/, '')}/hoteles-y-comunidades/`);
  });
});
