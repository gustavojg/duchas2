import { describe, expect, it } from 'vitest';
import { configFormulario } from './config.ts';
import { cargarFaq, cargarNegocio, type Resena } from './content.ts';
import { preguntasResueltas } from './faq.ts';
import {
  canonicalUrl,
  jsonLdBreadcrumbList,
  jsonLdFaqPage,
  jsonLdLocalBusiness,
  jsonLdScript,
  jsonLdService,
  metadataPagina,
  notaVisible,
  resumenResenas,
  urlAbsoluta,
} from './seo.ts';
import { APP_NAME } from './site.ts';

const negocio = cargarNegocio();

const fixture: Resena[] = [
  { autor: 'Ana', nota: 5, texto: 'Quedó como nuevo.', fecha: '2026-03-01', fuente: 'Google' },
  { autor: 'Luis', nota: 4, texto: 'Rápidos y limpios.', fecha: '2026-04-12', fuente: 'Google' },
  { autor: 'Marta', nota: 5, texto: 'Muy recomendables.', fecha: '2026-05-20', fuente: 'Google' },
];

type Ld = Record<string, unknown> & { aggregateRating?: Record<string, unknown> };

describe('reseñas', () => {
  it('sin reseñas no hay resumen ni AggregateRating', () => {
    expect(resumenResenas([])).toBeNull();
    expect(jsonLdLocalBusiness({ negocio, resenas: [] })).not.toHaveProperty('aggregateRating');
  });

  it('con reseñas calcula media y total, y la nota visible coincide con ratingValue', () => {
    expect(resumenResenas(fixture)).toEqual({ media: 4.7, total: 3 });
    expect(notaVisible(4.7)).toBe('4,7');
    expect(notaVisible(5)).toBe('5,0');
    const ld = jsonLdLocalBusiness({ negocio, resenas: fixture }) as Ld;
    expect(ld.aggregateRating).toMatchObject({
      '@type': 'AggregateRating',
      ratingValue: 4.7,
      reviewCount: 3,
      bestRating: 5,
      worstRating: 1,
    });
    expect(notaVisible(ld.aggregateRating!.ratingValue as number)).toBe('4,7');
  });
});

describe('LocalBusiness', () => {
  it('lleva tipo, nombre, url, zona y teléfono normalizado', () => {
    const ld = jsonLdLocalBusiness({ negocio, resenas: [] }) as Ld;
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('LocalBusiness');
    expect(ld.telephone).toBe('+34600000000');
    expect(ld.name).toBe(negocio.marca.valor);
    expect(ld.url).toBe(negocio.url_base);
    expect(ld.areaServed).toBe('Madrid');
  });

  it('sin teléfono no lleva telephone', () => {
    const sin = structuredClone(negocio);
    sin.telefono = { valor: null, confirmado: false };
    expect(jsonLdLocalBusiness({ negocio: sin, resenas: [] })).not.toHaveProperty('telephone');
  });
});

describe('FAQPage', () => {
  it('lleva las mismas preguntas y respuestas, en el mismo orden', () => {
    const preguntas = preguntasResueltas(cargarFaq(), {
      negocio,
      retencion_dias: configFormulario({}).retencion_dias,
      modo: 'publico',
    }).flatMap((t) => t.preguntas);
    const ld = jsonLdFaqPage(preguntas) as {
      '@type': string;
      mainEntity: { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }[];
    };
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity.map((q) => q.name)).toEqual(preguntas.map((q) => q.p));
    expect(ld.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(preguntas.map((q) => q.r));
    for (const q of ld.mainEntity) {
      expect(q['@type']).toBe('Question');
      expect(q.acceptedAnswer['@type']).toBe('Answer');
    }
  });
});

describe('jsonLdScript', () => {
  it('escapa < para que no cierre el <script> y sigue siendo JSON válido', () => {
    const s = jsonLdScript({ a: '</script>' });
    expect(s).not.toContain('</script>');
    expect(JSON.parse(s)).toEqual({ a: '</script>' });
  });
});

describe('urlAbsoluta', () => {
  it('quita la barra final de la base y concatena la ruta', () => {
    expect(urlAbsoluta('https://x.test/', '/tarifas/')).toBe('https://x.test/tarifas/');
    expect(urlAbsoluta('https://x.test', '/tarifas/')).toBe('https://x.test/tarifas/');
  });
});

describe('BreadcrumbList', () => {
  const migas = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre: 'Servicios', ruta: '/servicios/' },
    { nombre: 'Platos de ducha', ruta: '/platos-de-ducha/' },
  ];
  type Bc = { '@type': string; itemListElement: { '@type': string; position: number; name: string; item: string }[] };

  for (const base of ['https://x.test', 'https://x.test/']) {
    it(`posiciones desde 1 e item absoluto (base «${base}»)`, () => {
      const ld = jsonLdBreadcrumbList(migas, base) as Bc;
      expect(ld['@type']).toBe('BreadcrumbList');
      expect(ld.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
      expect(ld.itemListElement.map((i) => i.name)).toEqual(['Inicio', 'Servicios', 'Platos de ducha']);
      expect(ld.itemListElement.map((i) => i.item)).toEqual([
        'https://x.test/',
        'https://x.test/servicios/',
        'https://x.test/platos-de-ducha/',
      ]);
      for (const i of ld.itemListElement) expect(i['@type']).toBe('ListItem');
      expect(JSON.parse(jsonLdScript(ld))).toEqual(ld);
    });
  }
});

describe('Service', () => {
  it('lleva tipo, url absoluta, proveedor y zona, sin precios', () => {
    const ld = jsonLdService({
      nombre: 'Reparación de platos de ducha',
      descripcion: 'Reparamos tu plato.',
      urlBase: 'https://x.test/',
      ruta: '/platos-de-ducha/',
      negocio,
    }) as Record<string, unknown> & { provider: Record<string, unknown> };
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('Service');
    expect(ld.name).toBe('Reparación de platos de ducha');
    expect(ld.description).toBe('Reparamos tu plato.');
    expect(ld.url).toBe('https://x.test/platos-de-ducha/');
    expect(ld.areaServed).toBe('Madrid');
    expect(ld.provider).toEqual({ '@type': 'LocalBusiness', name: negocio.marca.valor });
    expect(ld).not.toHaveProperty('offers');
    expect(JSON.parse(jsonLdScript(ld))).toEqual(ld);
  });

  it('sin marca, el proveedor se llama APP_NAME', () => {
    const sin = structuredClone(negocio);
    sin.marca = { valor: null, confirmado: false };
    const ld = jsonLdService({ nombre: 'a', descripcion: 'b', urlBase: 'https://x.test', ruta: '/', negocio: sin }) as {
      provider: { name: string };
    };
    expect(ld.provider.name).toBe(APP_NAME);
  });
});

describe('metadataPagina', () => {
  it('title y description tal cual y canonical absoluto', () => {
    expect(metadataPagina({ title: 'T', description: 'D', ruta: '/tarifas/', urlBase: 'https://x.test/' })).toEqual({
      title: 'T',
      description: 'D',
      alternates: { canonical: 'https://x.test/tarifas/' },
    });
  });
});

describe('canonicalUrl', () => {
  it('une url_base y la ruta sin duplicar la barra', () => {
    expect(canonicalUrl('https://x.es/', '/preguntas-frecuentes/')).toBe('https://x.es/preguntas-frecuentes/');
    expect(canonicalUrl('https://x.es', '/preguntas-frecuentes/')).toBe('https://x.es/preguntas-frecuentes/');
  });

  it('la portada es url_base con una sola barra final', () => {
    expect(canonicalUrl('https://x.es/', '/')).toBe('https://x.es/');
    expect(canonicalUrl('https://x.es', '/')).toBe('https://x.es/');
  });

  it('la ruta siempre empieza y termina en «/» (trailingSlash)', () => {
    expect(canonicalUrl('https://x.es//', 'zonas')).toBe('https://x.es/zonas/');
    expect(canonicalUrl('https://x.es', '/zonas')).toBe('https://x.es/zonas/');
  });
});
