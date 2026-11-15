'use client';

import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import type { SVGProps } from 'react';
import { waLink } from '../lib/whatsapp';

/** Glifo propio de WhatsApp (bocadillo con auricular), en currentColor: blanco sobre el botón de marca. */
function GlifoWhatsApp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M4 20 l1.3 -3.9 A8 8 0 1 1 8 18.8 z" />
      <path d="M9.2 8.6 q0 3.6 3.4 5.8 l1.4 -1.2 l1.8 1 q-0.6 1.6 -2 1.6 q-5.6 -1.4 -6 -7 q0 -1.4 1.6 -2 l1 1.8 z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export interface BotonWhatsAppProps {
  /** Número de WhatsApp del fichero de contacto (web/content/negocio.json). */
  numero: string;
  /** Mensaje prellenado según la página de origen. */
  mensaje: string;
  /** Texto del botón (p. ej. «Manda la foto por WhatsApp»). */
  etiqueta: string;
  /** primary solo en la acción principal de la pantalla (hero); el resto de botones de WhatsApp, secondary. */
  variante?: 'primary' | 'secondary';
}

/**
 * La acción principal del producto: Button primario de Astryx con glifo, enlazado a wa.me con waLink().
 * Tamaño lg: su alto sale del token --size-element-lg, que globals.css fija en var(--spacing-12) (≥ 44 px).
 * La variante primary es el único Button primario de cada pantalla; los demás WhatsApp van en secondary. Cliente porque Icon de Astryx lo es y recibe el glifo como
 * componente.
 */
export function BotonWhatsApp({ numero, mensaje, etiqueta, variante = 'primary' }: BotonWhatsAppProps) {
  return (
    <Button
      variant={variante}
      size="lg"
      label={etiqueta}
      href={waLink(numero, mensaje)}
      target="_blank"
      rel="noopener noreferrer"
      icon={<Icon icon={GlifoWhatsApp} />}
    />
  );
}
