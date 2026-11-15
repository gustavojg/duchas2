'use client';

import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IDS_SIN_FLOTANTE, mensajePorRuta, type ServicioMensaje, waLink } from '../lib/whatsapp';
import { GlifoWhatsApp } from './BotonWhatsApp';

export interface BotonFlotanteWhatsAppProps {
  /** Número de WhatsApp de web/content/negocio.json. */
  numero: string;
  /** Servicios con mensaje propio (web/content/servicios.json cuando exista). */
  servicios?: readonly ServicioMensaje[];
}

/**
 * Píldora fija de WhatsApp abajo a la derecha (brain/design.md § Patrones), con el mensaje de la ruta actual.
 * Se monta una vez en layout.tsx. Mientras se ve el CTA del hero o el «Enviar petición» del formulario
 * (IDS_SIN_FLOTANTE) se oculta con aria-hidden y la clase `boton-flotante-oculto`, sin desmontarse, para no
 * sumar otro primario en pantalla ni tapar el envío. Sin IntersectionObserver queda siempre visible.
 */
export function BotonFlotanteWhatsApp({ numero, servicios }: BotonFlotanteWhatsAppProps) {
  const ruta = usePathname() ?? '/';
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    setOculto(false);
    if (typeof IntersectionObserver === 'undefined') return;
    const visibles = new Set<Element>();
    const observer = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) visibles.add(e.target);
        else visibles.delete(e.target);
      }
      setOculto(visibles.size > 0);
    });
    for (const id of IDS_SIN_FLOTANTE) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ruta]);

  return (
    <Button
      variant="primary"
      size="lg"
      label="WhatsApp"
      href={waLink(numero, mensajePorRuta(ruta, servicios))}
      target="_blank"
      rel="noopener noreferrer"
      icon={<Icon icon={GlifoWhatsApp} />}
      className={oculto ? 'boton-flotante boton-flotante-oculto' : 'boton-flotante'}
      aria-hidden={oculto ? true : undefined}
      tabIndex={oculto ? -1 : undefined}
    />
  );
}
