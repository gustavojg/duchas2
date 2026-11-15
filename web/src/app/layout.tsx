import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { APP_NAME, NAV } from '../config';
import { DESCRIPTION } from '../lib/site';
import { Frame } from '../ui/Frame';

export const metadata: Metadata = {
  title: `${APP_NAME} · Reparación y esmaltado de platos de ducha en Madrid`,
  description: DESCRIPTION,
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Frame brand={APP_NAME} nav={NAV}>
          {children}
        </Frame>
      </body>
    </html>
  );
}
