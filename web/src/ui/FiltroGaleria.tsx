'use client';

import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { useState } from 'react';
import type { ParGaleria } from '../lib/content';
import { filtrarPares, type ServicioFiltro, TODOS } from '../lib/galeria';
import { HuecoFoto } from './HuecoFoto';

export interface FiltroGaleriaProps {
  pares: ParGaleria[];
  /** Servicios con pares (serviciosConPares de lib/galeria.ts), en el orden de servicios.json. */
  servicios: ServicioFiltro[];
}

export interface FiltroGaleriaVistaProps extends FiltroGaleriaProps {
  /** Slug elegido o «todos». */
  elegido: string;
  onElegir: (servicio: string) => void;
}

/**
 * Vista sin estado del filtro: SegmentedControl «Todos» + un segmento por servicio, y debajo la lista de pares
 * filtrados. Cada par, dos HuecoFoto (antes y después): la foto real con su alt o, sin foto, la ilustración con la
 * cinta, el aviso y el texto `hueco` de galeria.json.
 */
export function FiltroGaleriaVista({ pares, servicios, elegido, onElegir }: FiltroGaleriaVistaProps) {
  const visibles = filtrarPares(pares, elegido);
  return (
    <VStack gap={5}>
      <SegmentedControl label="Filtrar por servicio" value={elegido} onChange={onElegir}>
        <SegmentedControlItem value={TODOS} label="Todos" />
        {servicios.map((s) => (
          <SegmentedControlItem key={s.slug} value={s.slug} label={s.nombre} />
        ))}
      </SegmentedControl>
      <VStack gap={6} as="ul" aria-label="Trabajos antes y después">
        {visibles.map((par) => (
          <VStack gap={3} as="li" key={`${par.servicio}-${par.alt_antes}`}>
            <VStack gap={2}>
              <Text as="p" weight="bold">
                Antes
              </Text>
              <HuecoFoto par={par} lado="antes" />
            </VStack>
            <VStack gap={2}>
              <Text as="p" weight="bold">
                Después
              </Text>
              <HuecoFoto par={par} lado="despues" />
            </VStack>
          </VStack>
        ))}
      </VStack>
    </VStack>
  );
}

/** Galería antes/después con filtro por servicio; «Todos» al principio. Cliente porque guarda el servicio elegido. */
export function FiltroGaleria({ pares, servicios }: FiltroGaleriaProps) {
  const [elegido, setElegido] = useState<string>(TODOS);
  return <FiltroGaleriaVista pares={pares} servicios={servicios} elegido={elegido} onElegir={setElegido} />;
}
