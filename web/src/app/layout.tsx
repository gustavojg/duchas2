import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { APP_NAME, LEGALES, NAV } from '../config';
import { esBorrador } from '../lib/borrador';
import { configFormulario } from '../lib/config';
import { cargarNegocio } from '../lib/content';
import { modoActual } from '../lib/dato';
import { robotsMeta } from '../lib/seo';
import { DESCRIPTION, normalizarBase } from '../lib/site';
import { telLink } from '../lib/whatsapp';
import { BotonFlotanteWhatsApp } from '../ui/BotonFlotanteWhatsApp';
import { Frame } from '../ui/Frame';
import { PieSitio } from '../ui/PieSitio';

const negocio = cargarNegocio();

/**
 * Valores por defecto; cada página pone los suyos con metadataPagina (lib/seo). En borrador, noindex global.
 * Canonical absoluto por página con `url_base` de negocio.json (ADR 0005): `metadataBase` + `./` resuelve a la
 * ruta de cada página con barra final (trailingSlash), igual que canonicalUrl de lib/site.ts y que el sitemap.
 * Las páginas con su propio `metadata` heredan `alternates`. Lo comprueba tests/build/out.test.ts.
 */
export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(normalizarBase(negocio.url_base)),
    title: `${APP_NAME} · Reparación y esmaltado de platos de ducha en Madrid`,
    description: DESCRIPTION,
    alternates: { canonical: './' },
    robots: robotsMeta(esBorrador(negocio)),
  };
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  const telefono = negocio.telefono.valor;
  const whatsapp = negocio.whatsapp.valor;
  const llamar = telefono ? { href: telLink(telefono), etiqueta: 'Llamar' } : undefined;
  return (
    <html lang="es">
      <body>
        <Frame
          brand={APP_NAME}
          nav={NAV}
          llamar={llamar}
          footer={
            <PieSitio
              negocio={negocio}
              config={configFormulario()}
              modo={modoActual()}
              legales={LEGALES}
              // Solo servicios con página; aún no hay ninguna. Volver a cargarServicios() al crear las páginas de servicio.
              servicios={[]}
            />
          }
        >
          {children}
          {/* Una sola vez para todo el sitio. */}
          {whatsapp ? <BotonFlotanteWhatsApp numero={whatsapp} /> : null}
        </Frame>
      </body>
    </html>
  );
}
