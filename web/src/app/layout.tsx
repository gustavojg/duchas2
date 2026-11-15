import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { APP_NAME, NAV } from '../config';
import { Frame } from '../ui/Frame';

export const metadata: Metadata = { title: APP_NAME };
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
