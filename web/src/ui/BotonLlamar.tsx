'use client';

import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import type { SVGProps } from 'react';

/** Glifo propio de teléfono, en currentColor. */
function GlifoTelefono(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M5 3 h4 l2 5 l-2.5 1.5 a11 11 0 0 0 6 6 L16 13 l5 2 v4 a2 2 0 0 1 -2 2 A16 16 0 0 1 3 5 a2 2 0 0 1 2 -2" />
    </svg>
  );
}

export interface BotonLlamarProps {
  /** Enlace tel: construido con telLink() del teléfono de web/content/negocio.json. */
  href: string;
  etiqueta: string;
}

/**
 * «Llamar»: siempre Button secundario con icono (el primario es WhatsApp). Lo usan la cabecera (Frame) y el
 * hero. Cliente porque Icon de Astryx lo es y recibe el glifo como componente. Tamaño lg: alto del token
 * --size-element-lg (≥ 44 px, globals.css).
 */
export function BotonLlamar({ href, etiqueta }: BotonLlamarProps) {
  return <Button variant="secondary" size="lg" label={etiqueta} href={href} icon={<Icon icon={GlifoTelefono} />} />;
}
