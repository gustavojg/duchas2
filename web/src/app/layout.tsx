import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { APP_NAME, LEGALES, NAV } from '../config';
import { esBorrador } from '../lib/borrador';
import { configFormulario } from '../lib/config';
import { cargarNegocio, cargarServicios } from '../lib/content';
import { modoActual } from '../lib/dato';
import { robotsMeta } from '../lib/seo';
import { DESCRIPTION } from '../lib/site';
import { telLink } from '../lib/whatsapp';
import { BotonFlotanteWhatsApp } from '../ui/BotonFlotanteWhatsApp';
import { Frame } from '../ui/Frame';
import { PieSitio } from '../ui/PieSitio';

const negocio = cargarNegocio();

/** Valores por defecto; cada página pone los suyos con metadataPagina (lib/seo). En borrador, noindex global. */
export const metadata: Metadata = {
  metadataBase: new URL(negocio.url_base),
  title: `${APP_NAME} · Reparación y esmaltado de platos de ducha en Madrid`,
  description: DESCRIPTION,
  robots: robotsMeta(esBorrador(negocio)),
};
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
              servicios={cargarServicios()}
            />
          }
        >
          {children}
          {/* Una sola vez para todo el sitio. Cuando exista web/content/servicios.json, pasarle `servicios`. */}
          {whatsapp ? <BotonFlotanteWhatsApp numero={whatsapp} /> : null}
        </Frame>
      </body>
    </html>
  );
}
