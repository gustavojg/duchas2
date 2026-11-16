'use client';

import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { useEffect, useState } from 'react';
import { type Eleccion, ga4IdValido, guardarEleccion, leerEleccion, urlGa4 } from '../lib/analitica';

export interface BannerCookiesVistaProps {
  onAceptar: () => void;
  onRechazar: () => void;
}

/**
 * Vista pura del banner de cookies: Banner (`collapsible={false}`, sin `endContent`, que pinta estilo en línea)
 * con un texto breve, enlace a /cookies/ y «Aceptar»/«Rechazar» con el mismo peso (secondary, lg): el primario de
 * la pantalla es WhatsApp. La posición fija la da `.banner-cookies` de globals.css.
 */
export function BannerCookiesVista({ onAceptar, onRechazar }: BannerCookiesVistaProps) {
  return (
    <VStack className="banner-cookies">
      <Banner status="info" title="Cookies de analítica" container="card" elevation="med" collapsible={false}>
        <VStack gap={3}>
          <Text as="p">
            Usamos cookies de Google Analytics para saber cómo se usa la web, solo si las aceptas.{' '}
            <Link href="/cookies/">Más información</Link>
          </Text>
          <HStack gap={2} className="banner-cookies-acciones">
            <Button variant="secondary" size="lg" label="Aceptar" onClick={onAceptar} />
            <Button variant="secondary" size="lg" label="Rechazar" onClick={onRechazar} />
          </HStack>
        </VStack>
      </Banner>
    </VStack>
  );
}

/** Añade gtag.js y su init a document.head; no hace nada si ya está el script con ese src. */
function inyectarGa(id: string) {
  const src = urlGa4(id);
  for (const s of Array.from(document.scripts)) if (s.getAttribute('src') === src) return;
  const gtag = document.createElement('script');
  gtag.async = true;
  gtag.src = src;
  const init = document.createElement('script');
  init.textContent = [
    'window.dataLayer = window.dataLayer || [];',
    'function gtag(){dataLayer.push(arguments);}',
    "gtag('js', new Date());",
    `gtag('config', ${JSON.stringify(id)});`,
  ].join('\n');
  document.head.append(gtag, init);
}

type Estado = 'cargando' | Eleccion | null;

export interface BannerCookiesProps {
  /** `analitica.ga4_id` de negocio.json. */
  ga4Id: string | null;
}

/**
 * Banner de cookies con GA4 opt-in. Sin id válido no hay banner ni script. Con id, la elección se lee de
 * localStorage en el efecto (el HTML estático no lleva nada): sin elección pinta la vista; con 'aceptadas'
 * inyecta GA al montar; con 'rechazadas', nada. Se monta una vez en layout.tsx.
 */
export function BannerCookies({ ga4Id }: BannerCookiesProps) {
  const valido = ga4IdValido(ga4Id);
  const [estado, setEstado] = useState<Estado>('cargando');

  useEffect(() => {
    if (!valido || !ga4Id) return;
    const eleccion = leerEleccion(window.localStorage);
    if (eleccion === 'aceptadas') inyectarGa(ga4Id);
    setEstado(eleccion);
  }, [valido, ga4Id]);

  if (!valido || !ga4Id || estado !== null) return null;

  return (
    <BannerCookiesVista
      onAceptar={() => {
        guardarEleccion(window.localStorage, 'aceptadas');
        inyectarGa(ga4Id);
        setEstado('aceptadas');
      }}
      onRechazar={() => {
        guardarEleccion(window.localStorage, 'rechazadas');
        setEstado('rechazadas');
      }}
    />
  );
}
