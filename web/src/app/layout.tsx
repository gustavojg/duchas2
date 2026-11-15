import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { APP_NAME, NAV } from '../config';
import { cargarNegocio } from '../lib/content';
import { DESCRIPTION } from '../lib/site';
import { telLink } from '../lib/whatsapp';
import { Frame } from '../ui/Frame';

export const metadata: Metadata = {
  title: `${APP_NAME} · Reparación y esmaltado de platos de ducha en Madrid`,
  description: DESCRIPTION,
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  const telefono = cargarNegocio().telefono.valor;
  const llamar = telefono ? { href: telLink(telefono), etiqueta: 'Llamar' } : undefined;
  return (
    <html lang="es">
      <body>
        <Frame brand={APP_NAME} nav={NAV} llamar={llamar}>
          {children}
        </Frame>
      </body>
    </html>
  );
}
