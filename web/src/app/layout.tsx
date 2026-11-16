import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { APP_NAME, NAV } from '../config';
import { cargarNegocio } from '../lib/content';
import { DESCRIPTION, normalizarBase } from '../lib/site';
import { telLink } from '../lib/whatsapp';
import { BotonFlotanteWhatsApp } from '../ui/BotonFlotanteWhatsApp';
import { Frame } from '../ui/Frame';

/**
 * Canonical absoluto por página con `url_base` de negocio.json (ADR 0005): `metadataBase` + `./` resuelve a la
 * ruta de cada página con barra final (trailingSlash), igual que canonicalUrl de lib/site.ts y que el sitemap.
 * Las páginas con su propio `metadata` heredan `alternates`. Lo comprueba tests/build/out.test.ts.
 */
export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(normalizarBase(cargarNegocio().url_base)),
    title: `${APP_NAME} · Reparación y esmaltado de platos de ducha en Madrid`,
    description: DESCRIPTION,
    alternates: { canonical: './' },
  };
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  const negocio = cargarNegocio();
  const telefono = negocio.telefono.valor;
  const whatsapp = negocio.whatsapp.valor;
  const llamar = telefono ? { href: telLink(telefono), etiqueta: 'Llamar' } : undefined;
  return (
    <html lang="es">
      <body>
        <Frame brand={APP_NAME} nav={NAV} llamar={llamar}>
          {children}
          {/* Una sola vez para todo el sitio. Cuando exista web/content/servicios.json, pasarle `servicios`. */}
          {whatsapp ? <BotonFlotanteWhatsApp numero={whatsapp} /> : null}
        </Frame>
      </body>
    </html>
  );
}
