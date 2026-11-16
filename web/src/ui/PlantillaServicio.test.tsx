import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargarNegocio, cargarServicios, type Negocio, type ParGaleria, type Servicio } from '../lib/content';
import { PlantillaServicio, type PlantillaServicioProps } from './PlantillaServicio';

const negocio = cargarNegocio();
const reales = cargarServicios();

/** Servicio fixture: no toca servicios.json. Sus relacionados apuntan a servicios reales. */
const fixture: Servicio = {
  slug: 'grifos-de-prueba',
  nombre: 'Reparación de grifos de prueba',
  ruta: '/servicios/grifos-de-prueba/',
  tipo: 'servicio',
  orden: 50,
  resumen: 'Arreglamos el grifo de prueba en tu baño.',
  problema: 'El grifo de prueba gotea y no cierra bien.',
  como: ['Cerramos el agua.', 'Cambiamos la pieza.', 'Probamos el grifo.', 'Limpiamos la zona.'],
  precio_desde: { valor: null, confirmado: false },
  faqs: [
    { p: '¿Tarda mucho el grifo?', r: 'No, poco rato.' },
    { p: '¿Hay que cambiar el grifo?', r: 'Casi nunca.' },
  ],
  relacionados: ['azulejos', 'mamparas', 'juntas-y-sellado'],
  whatsapp_mensaje: 'Hola, os mando una foto de mi grifo de prueba.',
  seo: { title: 'Grifos de prueba en Madrid', description: 'Arreglamos grifos de prueba.' },
  imagen_tarjeta: 'juntas',
};

const servicios = [...reales, fixture];
const base: PlantillaServicioProps = { servicio: fixture, servicios, negocio, modo: 'publico', galeria: [] };
const pinta = (otro: Partial<PlantillaServicioProps> = {}) => renderToStaticMarkup(<PlantillaServicio {...base} {...otro} />);
const decodificar = (t: string) =>
  t.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const textoPlano = (html: string) =>
  decodificar(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const h2s = (html: string) => [...html.matchAll(/<h2[^>]*>((?:(?!<\/h2>).)*)<\/h2>/gs)].map((m) => decodificar(m[1].replace(/<[^>]+>/g, '')));
const desplegables = (html: string) => (html.match(/aria-expanded=/g) ?? []).length;
const seccion = (html: string, id: string) => {
  const ini = html.indexOf(`aria-labelledby="${id}"`);
  expect(ini, `falta la sección ${id}`).toBeGreaterThan(-1);
  const fin = html.indexOf('</section>', ini);
  return html.slice(ini, fin);
};

const html = pinta();
const texto = textoPlano(html);

describe('PlantillaServicio', () => {
  it('tiene un solo H1 con el nombre del servicio y «Madrid»', () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    const h1 = decodificar(/<h1[^>]*>((?:(?!<\/h1>).)*)<\/h1>/s.exec(html)![1]);
    expect(h1).toBe('Reparación de grifos de prueba en Madrid');
  });

  it('migas Inicio › servicio, cinta y resumen en el hero', () => {
    expect(html).toContain('aria-label="Migas de pan"');
    expect(html).toContain('href="/"');
    expect(texto).toContain('MADRID · REPARACIÓN DE GRIFOS DE PRUEBA');
    expect(texto).toContain(fixture.resumen);
  });

  it('pinta las secciones problema, cómo, precio, antes/después, FAQ y relacionados', () => {
    const t = h2s(html);
    expect(t).toContain('¿Qué problema resuelve?');
    expect(t).toContain('Cómo lo hacemos');
    expect(t).toContain('Antes y después');
    expect(t).toContain('También te puede interesar');
    expect(t.some((h) => /cuesta/i.test(h))).toBe(true);
    expect(t.some((h) => /preguntas/i.test(h))).toBe(true);
    expect(texto).toContain(fixture.problema);
    for (const paso of fixture.como) expect(texto).toContain(paso);
  });

  it('pinta un «PASO N» por cada paso de `como`, en lista ordenada', () => {
    const pasos = [...html.matchAll(/PASO (\d+)/g)].map((m) => Number(m[1]));
    expect(pasos).toEqual([1, 2, 3, 4]);
    expect(seccion(html, 'servicio-como')).toContain('<ol');
    const corto = pinta({ servicio: { ...fixture, como: ['Uno.', 'Dos.'] } });
    expect(corto.match(/PASO \d+/g)).toHaveLength(2);
  });

  it('sin precio confirmado sale «Pide presupuesto gratuito»; confirmado, «Desde 120 €»', () => {
    expect(texto).toContain('Pide presupuesto gratuito');
    const con = textoPlano(pinta({ servicio: { ...fixture, precio_desde: { valor: 120, confirmado: true } } }));
    expect(con).toContain('Desde 120 €');
    expect(con).not.toContain('Pide presupuesto gratuito');
  });

  it('pinta tantos desplegables como FAQ (2 y 4)', () => {
    expect(desplegables(seccion(html, 'servicio-faq'))).toBe(2);
    const cuatro = [...fixture.faqs, { p: '¿Tercera?', r: 'Sí.' }, { p: '¿Cuarta?', r: 'También.' }];
    const h = pinta({ servicio: { ...fixture, faqs: cuatro } });
    expect(desplegables(seccion(h, 'servicio-faq'))).toBe(4);
    for (const q of cuatro) expect(textoPlano(h)).toContain(q.p);
  });

  it('relacionados: 3 enlaces con 3, 2 con 2, e ignora slugs que no existen', () => {
    const rel = (s: Servicio) => {
      const sec = seccion(pinta({ servicio: s }), 'servicio-relacionados');
      return [...sec.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    };
    expect(rel(fixture)).toEqual(['/servicios/azulejos/', '/servicios/mamparas/', '/servicios/juntas-y-sellado/']);
    expect(rel({ ...fixture, relacionados: ['azulejos', 'mamparas'] })).toEqual(['/servicios/azulejos/', '/servicios/mamparas/']);
    expect(rel({ ...fixture, relacionados: ['azulejos', 'no-existe', 'mamparas'] })).toEqual([
      '/servicios/azulejos/',
      '/servicios/mamparas/',
    ]);
    expect(rel({ ...fixture, relacionados: ['azulejos', 'mamparas', 'juntas-y-sellado', 'marmol-y-piedra'] })).toHaveLength(3);
  });

  it('el WhatsApp lleva el mensaje del servicio codificado', () => {
    const digitos = negocio.whatsapp.valor!.replace(/\D/g, '');
    const href = `https://wa.me/${digitos}?text=${encodeURIComponent(fixture.whatsapp_mensaje)}`;
    expect(html).toContain(`href="${href.replace(/&/g, '&amp;')}"`);
    expect(fixture.whatsapp_mensaje).toContain('grifo de prueba');
    const hero = html.slice(html.indexOf('id="cta-hero"'));
    expect(hero).toContain('wa.me');
  });

  it('sin pares en la galería pinta el hueco del servicio; con un par real, su alt', () => {
    expect(texto).toContain('Foto de Reparación de grifos de prueba antes y después');
    const par: ParGaleria = {
      servicio: fixture.slug,
      antes: '/fotos/grifo-antes.webp',
      despues: '/fotos/grifo-despues.webp',
      alt_antes: 'Grifo de prueba oxidado antes de repararlo',
      alt_despues: 'Grifo de prueba brillante después',
    };
    const otro: ParGaleria = { ...par, servicio: 'azulejos', alt_antes: 'Azulejo de otro servicio', alt_despues: 'Azulejo después' };
    const con = pinta({ galeria: [par, otro] });
    expect(con).toContain(par.alt_antes);
    expect(con).not.toContain('Azulejo de otro servicio');
    expect(textoPlano(con)).not.toContain('Foto de Reparación de grifos de prueba antes y después');
  });

  it('sin teléfono no hay botón «Llamar»; con teléfono, sí', () => {
    expect(texto).toContain('Llamar');
    const sinTel: Negocio = { ...negocio, telefono: { valor: null, confirmado: false } };
    expect(textoPlano(pinta({ negocio: sinTel }))).not.toContain('Llamar');
    const malo: Negocio = { ...negocio, telefono: { valor: '123', confirmado: false } };
    expect(textoPlano(pinta({ negocio: malo }))).not.toContain('Llamar');
  });

  it('no contiene «PENDIENTE» ni «{{» y no usa estilos en línea', () => {
    expect(html).not.toContain('PENDIENTE');
    expect(html).not.toContain('{{');
  });

  it('JSON-LD Service y BreadcrumbList, sin FAQPage', () => {
    expect(html).toContain('"@type":"Service"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).not.toContain('"@type":"FAQPage"');
    expect(html).toContain(`${negocio.url_base.replace(/\/+$/, '')}${fixture.ruta}`);
  });
});
