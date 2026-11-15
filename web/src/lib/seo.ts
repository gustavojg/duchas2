/**
 * Datos estructurados (JSON-LD) y resumen de reseñas. El mismo resumen alimenta el bloque visible
 * (BloqueResenas) y AggregateRating; sin reseñas no hay ninguno de los dos (brain/CONTEXT.md).
 * Puro: sin React, Next, Astryx, node:* ni window.
 */
import type { Negocio, Resena } from './content.ts';
import { APP_NAME, DESCRIPTION } from './site.ts';
import { telLink } from './whatsapp.ts';

export interface ResumenResenas {
  media: number;
  total: number;
}

/** Media de `nota` con un decimal y número de reseñas; null si no hay ninguna. */
export function resumenResenas(resenas: Resena[]): ResumenResenas | null {
  if (resenas.length === 0) return null;
  const suma = resenas.reduce((s, r) => s + r.nota, 0);
  return { media: Math.round((suma / resenas.length) * 10) / 10, total: resenas.length };
}

/** La media como se lee en la página: coma decimal y un decimal («4,7», «5,0»). */
export function notaVisible(media: number): string {
  return media.toFixed(1).replace('.', ',');
}

export function jsonLdLocalBusiness({ negocio, resenas }: { negocio: Negocio; resenas: Resena[] }): object {
  const telefono = negocio.telefono.valor;
  const resumen = resumenResenas(resenas);
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: negocio.marca.valor ?? APP_NAME,
    description: DESCRIPTION,
    url: negocio.url_base,
    ...(telefono ? { telephone: telLink(telefono).slice(4) } : {}),
    areaServed: 'Madrid',
    ...(resumen
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: resumen.media,
            reviewCount: resumen.total,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

/** FAQPage con las preguntas ya resueltas por faq.ts, en el mismo orden en que se pintan. */
export function jsonLdFaqPage(preguntas: { p: string; r: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: preguntas.map((q) => ({
      '@type': 'Question',
      name: q.p,
      acceptedAnswer: { '@type': 'Answer', text: q.r },
    })),
  };
}

/**
 * URL canónica de una página: url_base (negocio.json) sin barras finales + la ruta con barra inicial y final
 * (trailingSlash). `canonicalUrl('https://x.es/', '/')` → `https://x.es/`.
 */
export function canonicalUrl(baseUrl: string, ruta: string): string {
  const limpia = ruta.replace(/^\/+|\/+$/g, '');
  return `${baseUrl.replace(/\/+$/, '')}/${limpia ? `${limpia}/` : ''}`;
}

/** JSON para incrustar en <script type="application/ld+json">: «<» escapado para que nada cierre el script. */
export function jsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
