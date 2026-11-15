/**
 * Metadatos SEO por página (ADR 0005): title, description, canonical y Open Graph únicos por ruta, y robots
 * según el modo borrador. Puro y sin importar de 'next': devuelve objetos con forma compatible con `Metadata`.
 */

export interface DatosPagina {
  /** Ruta con barra inicial y final (`/privacidad/`). */
  ruta: string;
  titulo: string;
  descripcion: string;
  /** URL base del sitio (negocio.json › url_base); se le quitan las barras finales. */
  baseUrl: string;
  nombreSitio: string;
}

export interface MetadataPagina {
  title: string;
  description: string;
  alternates: { canonical: string };
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    locale: 'es_ES';
    type: 'website';
  };
}

export function metadataPagina({ ruta, titulo, descripcion, baseUrl, nombreSitio }: DatosPagina): MetadataPagina {
  const title = `${titulo} · ${nombreSitio}`;
  const url = `${baseUrl.replace(/\/+$/, '')}${ruta}`;
  return {
    title,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: { title, description: descripcion, url, siteName: nombreSitio, locale: 'es_ES', type: 'website' },
  };
}

/** En borrador, ni indexar ni seguir enlaces (meta robots, no robots.txt: ADR 0005). */
export function robotsMeta(borrador: boolean): { index: boolean; follow: boolean } {
  return borrador ? { index: false, follow: false } : { index: true, follow: true };
}
