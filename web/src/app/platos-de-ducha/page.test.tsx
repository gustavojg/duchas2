import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { configFormulario } from '../../lib/config';
import {
  cargarComparativa,
  cargarGaleria,
  cargarNegocio,
  cargarPasos,
  cargarPlatoDucha,
  cargarServicios,
  type Negocio,
  type ParGaleria,
  type PlatoDucha,
} from '../../lib/content';
import type { Modo } from '../../lib/dato';
import { mensajePorRuta } from '../../lib/whatsapp';
import { generateMetadata, metadataPlatosDeDucha, PaginaPlatosDeDucha, type PaginaPlatosDeDuchaProps } from './page';

const negocio = cargarNegocio();
const servicios = cargarServicios();
const contenido = cargarPlatoDucha();
const base: PaginaPlatosDeDuchaProps = {
  negocio,
  config: configFormulario({}),
  modo: 'publico',
  servicios,
  contenido,
  comparativa: cargarComparativa(),
  galeria: cargarGaleria(),
  pasos: cargarPasos(),
};

const pinta = (otro: Partial<PaginaPlatosDeDuchaProps> = {}) => renderToStaticMarkup(<PaginaPlatosDeDucha {...base} {...otro} />);
const sinScripts = (html: string) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
const textoPlano = (html: string) =>
  sinScripts(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
const jsonLd = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]) as Record<string, unknown>);
const h2s = (html: string) =>
  [...html.matchAll(/<h2[^>]*>((?:(?!<\/h2>).)*)<\/h2>/gs)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
  );
const conMateriales = (materiales: PlatoDucha['materiales']): PlatoDucha => ({ ...contenido, materiales });

const html = pinta();

describe('/platos-de-ducha/', () => {
  it('tiene un solo H1 con «plato de ducha» y «Madrid»', () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    const h1 = /<h1[^>]*>((?:(?!<\/h1>).)*)<\/h1>/s.exec(html)![1];
    expect(h1).toContain('plato de ducha');
    expect(h1).toContain('Madrid');
  });

  it('pinta los 6 daños: rejilla con 6 anclas y un H2 por daño', () => {
    const titulos = h2s(html);
    for (const d of contenido.danos) {
      expect(titulos).toContain(d.titulo);
      expect(html).toContain(`href="#${d.id}"`);
      expect(html).toMatch(new RegExp(`<section[^>]*aria-labelledby="${d.id}"`));
      expect(html).toMatch(new RegExp(`<h2[^>]*id="${d.id}"`));
    }
    expect(html.match(/href="#(grieta|golpe|desconchon|perforacion|oxido|brillo)"/g)).toHaveLength(6);
  });

  it('el texto largo de los daños lleva la clase con --measure', () => {
    expect(html).toContain('texto-largo');
  });

  it('tiene los H2 de antideslizante y cambio de color', () => {
    const titulos = h2s(html);
    expect(titulos).toContain(contenido.antideslizante.titulo);
    expect(titulos).toContain(contenido.cambio_color.titulo);
  });

  describe('materiales', () => {
    const lista = (h: string) => /<ul[^>]*aria-label="Materiales que reparamos"[^>]*>([\s\S]*?)<\/ul>/.exec(h)?.[1] ?? '';
    const materiales: PlatoDucha['materiales'] = [
      { nombre: 'Resina', reparable: { valor: null, confirmado: false } },
      { nombre: 'Carga mineral', reparable: { valor: false, confirmado: true } },
      { nombre: 'Acrílico', reparable: { valor: true, confirmado: true } },
    ];

    it('en público solo salen los confirmados como reparables', () => {
      const h = pinta({ contenido: conMateriales(materiales) });
      expect(lista(h)).toContain('Acrílico');
      expect(textoPlano(h)).not.toContain('Resina');
      expect(textoPlano(h)).not.toContain('Carga mineral');
      expect(h).not.toContain('PENDIENTE');
    });

    it('en pendientes los no confirmados salen con {{PENDIENTE}}', () => {
      const h = pinta({ contenido: conMateriales(materiales), modo: 'pendientes' });
      expect(lista(h)).toContain('Acrílico');
      expect(lista(h)).toMatch(/Resina[\s\S]*\{\{PENDIENTE\}\}/);
      expect(lista(h)).not.toContain('Carga mineral');
    });

    it('sin ninguno confirmado en público, el texto alternativo y sin lista', () => {
      expect(lista(html)).toBe('');
      expect(textoPlano(html)).toContain('Mándanos una foto de tu plato y te decimos si se puede reparar.');
    });
  });

  describe('FAQ', () => {
    const preguntas = (h: string) => [...h.matchAll(/aria-expanded=/g)].length;

    it('al menos 5 desplegables', () => {
      expect(preguntas(html)).toBeGreaterThanOrEqual(5);
      expect(preguntas(html)).toBe(contenido.faqs.length);
    });

    it('con uso_ducha sin confirmar, el texto alternativo; confirmado, el plazo', () => {
      expect(textoPlano(html)).toContain('Te decimos cuándo puedes usar la ducha');
      const conPlazo: Negocio = structuredClone(negocio);
      conPlazo.plazos.uso_ducha = { valor: 'al día siguiente', confirmado: true };
      const h = textoPlano(pinta({ negocio: conPlazo }));
      expect(h).toContain('Puedes usar la ducha al día siguiente');
      expect(h).not.toContain('Te decimos cuándo puedes usar la ducha');
    });
  });

  it('el WhatsApp lleva el mensaje de la página del plato', () => {
    const mensaje = 'Hola, vengo de la página de platos de ducha. Os mando una foto del daño';
    expect(mensajePorRuta('/platos-de-ducha/')).toBe(mensaje);
    expect(html).toContain(`https://wa.me/34600000000?text=${encodeURIComponent(mensaje)}`);
  });

  it('el CTA del hero está en #cta-hero y es el único primario', () => {
    expect(html).toMatch(/id="cta-hero"[\s\S]*?href="https:\/\/wa\.me\//);
    expect(html.match(/data-variant="primary"/g) ?? []).toHaveLength(1);
  });

  it('pone un CTA de WhatsApp tras cada dos daños', () => {
    const despues = (id: string) => html.split(new RegExp(`<h2[^>]*id="${id}"`))[1] ?? '';
    for (const id of ['golpe', 'perforacion', 'brillo']) {
      const tramo = despues(id).split(/<h2[\s>]/)[0];
      expect(tramo).toContain('https://wa.me/');
    }
  });

  it('la galería solo pinta pares de platos de ducha', () => {
    const par = (servicio: string, alt: string): ParGaleria => ({
      servicio,
      antes: null,
      despues: null,
      alt_antes: `${alt} antes`,
      alt_despues: `${alt} después`,
      hueco: `${alt} hueco`,
    });
    const h = pinta({ galeria: [par('platos-de-ducha', 'Plato uno'), par('baneras-completas', 'Bañera dos'), par('azulejos', 'Azulejo tres')] });
    expect(h).toContain('Plato uno hueco');
    expect(h).not.toContain('Bañera dos');
    expect(h).not.toContain('Azulejo tres');
  });

  it('sin pares del plato, el vacío de galería', () => {
    expect(textoPlano(pinta({ galeria: [] }))).toContain('Aún no hemos subido fotos de este trabajo.');
  });

  it('tiene «¿Reparar o cambiar?» con la tabla', () => {
    expect(h2s(html)).toContain('¿Reparar o cambiar?');
    expect(html).toMatch(/<table[\s>]/);
  });

  it('tiene migas visibles', () => {
    expect(html).toMatch(/<nav[^>]*aria-label="Migas de pan"/);
    expect(html).toContain('aria-current="page"');
  });

  it('el proceso resuelve el curado y el precio sale de PrecioDesde', () => {
    const t = textoPlano(html);
    expect(t).toContain(contenido.proceso.intro);
    expect(t).toContain('Pide presupuesto gratuito');
    expect(t).not.toMatch(/\{uso_ducha\}/);
  });

  it('relacionados: tarjetas de los servicios relacionados que existen', () => {
    const plato = servicios.find((s) => s.slug === 'platos-de-ducha')!;
    for (const slug of plato.relacionados) {
      const s = servicios.find((x) => x.slug === slug)!;
      expect(html).toContain(`href="${s.ruta}"`);
    }
  });

  it('JSON-LD: Service, FAQPage con las FAQ visibles y BreadcrumbList con las migas', () => {
    const lds = jsonLd(html);
    expect(lds.map((l) => l['@type']).sort()).toEqual(['BreadcrumbList', 'FAQPage', 'Service']);
    const faq = lds.find((l) => l['@type'] === 'FAQPage') as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(faq.mainEntity).toHaveLength([...html.matchAll(/aria-expanded=/g)].length);
    for (const q of faq.mainEntity) expect(textoPlano(html)).toContain(q.acceptedAnswer.text);
    const bc = lds.find((l) => l['@type'] === 'BreadcrumbList') as { itemListElement: { name: string; item: string }[] };
    expect(bc.itemListElement.map((i) => i.name)).toEqual(['Inicio', 'Platos de ducha']);
    expect(bc.itemListElement[1].item).toMatch(/\/platos-de-ducha\/$/);
    const service = lds.find((l) => l['@type'] === 'Service')!;
    expect(service.url).toMatch(/^https?:\/\/.+\/platos-de-ducha\/$/);
  });

  it('sin estilos en línea propios ni {{ en público', () => {
    const sinAstryx = sinScripts(html)
      .replace(/ style="(?:--[\w-]+:[\w.\s%(),-]+;?)+"/g, '')
      .replace(/ style="(?:--x-overflow[XY]:clip;?|overscroll-behavior-[xy]:auto;?)+"/g, '');
    expect(sinAstryx).not.toMatch(/\bstyle="/);
    expect(sinScripts(html)).not.toContain('{{');
  });

  it.each<Modo>(['publico', 'pendientes'])('renderiza en modo %s', (modo) => {
    expect(() => pinta({ modo })).not.toThrow();
  });
});

describe('metadatos de /platos-de-ducha/', () => {
  const plato = servicios.find((s) => s.slug === 'platos-de-ducha')!;

  it('title y description de servicios.json y canonical absoluto', () => {
    const m = metadataPlatosDeDucha(servicios, 'https://ejemplo.test/');
    expect(m.title).toBe(plato.seo.title);
    expect(m.description).toBe(plato.seo.description);
    expect(m.alternates.canonical).toBe('https://ejemplo.test/platos-de-ducha/');
  });

  it('generateMetadata usa url_base de negocio.json', () => {
    const m = generateMetadata();
    expect(m.alternates?.canonical).toBe(`${negocio.url_base.replace(/\/+$/, '')}/platos-de-ducha/`);
    expect(m.title).toBe(plato.seo.title);
  });
});
