'use client';

import { Selector } from '@astryxdesign/core/Selector';
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
 * Vista sin estado del filtro: Selector «Todos» + una opción por servicio (el nombre entero, que un SegmentedControl
 * recortaba a 360 px), y debajo la rejilla de pares filtrados con el nombre de su servicio. Cada par, dos HuecoFoto (antes y después): la foto real con su alt o, sin foto, la ilustración con la
 * cinta, el aviso y el texto `hueco` de galeria.json.
 */
export function FiltroGaleriaVista({ pares, servicios, elegido, onElegir }: FiltroGaleriaVistaProps) {
  const visibles = filtrarPares(pares, elegido);
  const opciones = [{ value: TODOS, label: 'Todos' }, ...servicios.map((s) => ({ value: s.slug, label: s.nombre }))];
  const nombreServicio = (slug: string) => servicios.find((s) => s.slug === slug)?.nombre ?? slug;
  return (
    <VStack gap={5}>
      <Selector
        label="Filtrar por servicio"
        options={opciones}
        value={elegido}
        onChange={(v: string | null) => onElegir(v ?? TODOS)}
        presentation="adaptive"
        containerClassName="galeria-filtro"
        renderValue={(o) => (
          <Text type="inherit" className="galeria-filtro-valor">
            {o.label}
          </Text>
        )}
      />
      <VStack gap={6} as="ul" aria-label="Trabajos antes y después" className="galeria-pares">
        {visibles.map((par) => (
          <VStack gap={3} as="li" key={`${par.servicio}-${par.alt_antes}`}>
            <Text as="p" weight="bold" color="accent">
              {nombreServicio(par.servicio)}
            </Text>
            <VStack gap={3} className="galeria-par-lados">
              <VStack gap={2} className="galeria-par-lado">
                <Text as="p" weight="bold">
                  Antes
                </Text>
                <HuecoFoto par={par} lado="antes" />
              </VStack>
              <VStack gap={2} className="galeria-par-lado">
                <Text as="p" weight="bold">
                  Después
                </Text>
                <HuecoFoto par={par} lado="despues" />
              </VStack>
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
