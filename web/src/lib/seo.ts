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

/** Una miga de pan: lo que se lee y la ruta (empieza y acaba en /). La misma lista pinta MigasDePan. */
export interface Miga {
  nombre: string;
  ruta: string;
}

/** URL absoluta: `urlBase` sin barra final + `ruta` (que empieza y acaba en /). */
export function urlAbsoluta(urlBase: string, ruta: string): string {
  return `${urlBase.replace(/\/+$/, '')}${ruta}`;
}

/** BreadcrumbList con las mismas migas que se ven en la página (position desde 1, item absoluto). */
export function jsonLdBreadcrumbList(migas: Miga[], urlBase: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: migas.map((m, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: m.nombre,
      item: urlAbsoluta(urlBase, m.ruta),
    })),
  };
}

/** Service de una página de servicio, en Madrid, prestado por el negocio. Sin precios ni ofertas. */
export function jsonLdService({
  nombre,
  descripcion,
  urlBase,
  ruta,
  negocio,
}: {
  nombre: string;
  descripcion: string;
  urlBase: string;
  ruta: string;
  negocio: Negocio;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: nombre,
    description: descripcion,
    url: urlAbsoluta(urlBase, ruta),
    areaServed: 'Madrid',
    provider: { '@type': 'LocalBusiness', name: negocio.marca.valor ?? APP_NAME },
  };
}

/** Metadatos de una página como objeto plano: compatible con `Metadata` de Next sin importar sus tipos. */
export interface MetadataPagina {
  title: string;
  description: string;
  alternates: { canonical: string };
}

/**
 * Metadatos de cada página: title y description tal cual y canonical absoluto con `url_base` de negocio.json.
 * La usan /platos-de-ducha/ y /tarifas/ desde `generateMetadata()`, y la reutilizan las entregas
 * servicios-hoteles-galeria y legales-seo-borrador para el resto de páginas.
 */
export function metadataPagina({
  title,
  description,
  ruta,
  urlBase,
}: {
  title: string;
  description: string;
  ruta: string;
  urlBase: string;
}): MetadataPagina {
  return { title, description, alternates: { canonical: urlAbsoluta(urlBase, ruta) } };
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
