import { AppShell } from '@astryxdesign/core/AppShell';
import { HStack } from '@astryxdesign/core/HStack';
import { InternationalizationProvider } from '@astryxdesign/core/i18n';
import { Layout, LayoutFooter } from '@astryxdesign/core/Layout';
import esES from '@astryxdesign/core/locales/es-ES.generated.js';
import { Theme } from '@astryxdesign/core/theme';
import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import type { ReactNode } from 'react';
import { BotonLlamar } from './BotonLlamar';
import { Nav, type NavItem } from './Nav';

/**
 * Marco de página sobre AppShell de Astryx: cabecera con marca, navegación y contexto de quien está
 * dentro; main; pie. Equivale a page() de node-hono-sqlite. Lo usa src/app/layout.tsx; las páginas solo
 * aportan el cuerpo. El tema aplicado debe ser el mismo cuyo CSS importa src/app/globals.css.
 */
export interface FrameProps {
  /** Nombre del producto en la cabecera. */
  brand: string;
  /** Enlace de la marca (por defecto /). */
  brandHref?: string;
  nav?: NavItem[];
  /** Quién está dentro y sus acciones (p. ej. nombre + botón salir). Vacío en páginas públicas. */
  who?: ReactNode;
  /** Botón «Llamar» de la cabecera fija (secundario, con icono). `href` sale de telLink(); sin él no se pinta. */
  llamar?: { href: string; etiqueta: string };
  footer?: ReactNode;
  children: ReactNode;
}

export function Frame({ brand, brandHref = '/', nav, who, llamar, footer, children }: FrameProps) {
  const end =
    llamar || who ? (
      <HStack gap={2} vAlign="center">
        {llamar ? <BotonLlamar {...llamar} /> : null}
        {who}
      </HStack>
    ) : undefined;
  const topNav = (
    <TopNav
      label="Principal"
      heading={<TopNavHeading heading={brand} headingHref={brandHref} />}
      startContent={nav?.length ? <Nav items={nav} /> : undefined}
      endContent={end}
    />
  );
  return (
    <InternationalizationProvider locale="es-ES" messages={{ 'es-ES': esES }}>
      <Theme theme={neutralTheme}>
        <AppShell height="auto" topNav={topNav}>
          {/* Sin contentWidth: Layout lo pasaría como estilo en línea con una variable CSS. */}
          <Layout height="auto" footer={footer ? <LayoutFooter hasDivider>{footer}</LayoutFooter> : undefined}>
            {children}
          </Layout>
        </AppShell>
      </Theme>
    </InternationalizationProvider>
  );
}
