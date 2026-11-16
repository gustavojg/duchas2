'use client';

import { Card } from '@astryxdesign/core/Card';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { Fragment, useState } from 'react';
import type { ParGaleria, Servicio } from '../lib/content';
import { filtrarPares, GALERIA_VACIA, grupos, opcionesFiltro, TODOS } from '../lib/galeria';
import { BotonWhatsApp } from './BotonWhatsApp';
import { HuecoFoto } from './HuecoFoto';

/** Pares por bloque: tras cada bloque que no sea el último va un CTA (brain/design.md § Antes y después). */
const POR_BLOQUE = 6;
const CTA = 'Manda la foto del tuyo';

export interface GaleriaFiltrableProps {
  servicios: readonly Servicio[];
  /** galeria.json. */
  pares: readonly ParGaleria[];
  /** Número de WhatsApp de negocio.json; sin él no hay botones. */
  whatsapp: string | null;
  mensaje: string;
}

/**
 * Galería antes/después filtrable (brain/design.md § Antes y después): SegmentedControl con «Todos» y los
 * servicios (opcionesFiltro) sobre una lista de pares. Cada par lleva encima el nombre de su servicio y dos
 * HuecoFoto (foto con alt o el hueco). Tras cada bloque de 6 pares que no sea el último, un WhatsApp secundario.
 * Si el filtro no deja pares, GALERIA_VACIA y WhatsApp. Cliente por el estado del filtro.
 */
export function GaleriaFiltrable({ servicios, pares, whatsapp, mensaje }: GaleriaFiltrableProps) {
  const [filtro, setFiltro] = useState(TODOS);
  const opciones = opcionesFiltro([...servicios]);
  const nombres = new Map(servicios.map((s) => [s.slug, s.nombre]));
  const visibles = filtrarPares(pares, filtro);
  const bloques = grupos(visibles, POR_BLOQUE);
  const boton = whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta={CTA} variante="secondary" /> : null;

  return (
    <VStack gap={6}>
      {/* .filtro-galeria (globals.css): las opciones saltan de línea y una etiqueta larga se parte, sin recortes ni scroll horizontal. */}
      <VStack className="filtro-galeria">
        <SegmentedControl label="Filtrar por servicio" value={filtro} onChange={setFiltro}>
          {opciones.map((o) => (
            <SegmentedControlItem key={o.valor} value={o.valor} label={o.etiqueta} />
          ))}
        </SegmentedControl>
      </VStack>

      {visibles.length === 0 ? (
        <VStack gap={3} hAlign="start" role="status">
          <Text as="p">{GALERIA_VACIA}</Text>
          {boton}
        </VStack>
      ) : (
        <VStack gap={6} as="ul" aria-label="Trabajos antes y después">
          {bloques.map((bloque, b) => (
            <Fragment key={b}>
              {bloque.map((par, i) => {
                const sinFotos = !par.antes && !par.despues;
                return (
                  <VStack as="li" key={`${par.servicio}-${b}-${i}`} data-par={par.servicio}>
                    <Card>
                      <VStack gap={3}>
                        <Text as="p" weight="bold">
                          {nombres.get(par.servicio) ?? par.servicio}
                        </Text>
                        <HuecoFoto par={par} lado="antes" />
                        <HuecoFoto par={par} lado="despues" compacta={sinFotos} />
                      </VStack>
                    </Card>
                  </VStack>
                );
              })}
              {b < bloques.length - 1 && boton ? (
                <VStack as="li" hAlign="start">
                  {boton}
                </VStack>
              ) : null}
            </Fragment>
          ))}
        </VStack>
      )}
    </VStack>
  );
}
