import { describe, expect, it } from 'vitest';
import { configFormulario } from './config.ts';
import { cargarFaq, cargarNegocio, type Resena } from './content.ts';
import { preguntasResueltas } from './faq.ts';
import { jsonLdFaqPage, jsonLdLocalBusiness, jsonLdScript, notaVisible, resumenResenas } from './seo.ts';

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
