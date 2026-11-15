'use client';

import { AspectRatio } from '@astryxdesign/core/AspectRatio';
import { HStack } from '@astryxdesign/core/HStack';
import { Overlay } from '@astryxdesign/core/Overlay';
import { Slider } from '@astryxdesign/core/Slider';
import { VStack } from '@astryxdesign/core/VStack';
import { useId, useState } from 'react';
import type { ParGaleria } from '../lib/content';
import { CintaEtiqueta } from './CintaEtiqueta';
import { HuecoFoto } from './HuecoFoto';

/** Lienzo del SVG en unidades de usuario: 100 de ancho = la posición del Slider (0-100); 4:3. */
const ANCHO = 100;
const ALTO = 75;
const ASA = 'var(--color-background-card)';
const ASA_BORDE = 'var(--color-text-primary)';

export interface DeslizadorAntesDespuesProps {
  par: ParGaleria;
}

/**
 * Comparador antes/después (docs/astryx-componentes.md, fila «deslizador antes/después»). Un Slider de Astryx
 * (arrastre táctil y flechas, con aria-valuenow) mueve la posición 0-100. Con fotos, la «antes» va debajo y
 * la «después» encima, recortada con un <clipPath> SVG cuyo <rect> mide la posición (atributos SVG, sin estilo en línea), con el asa
 * en el borde. Sin fotos (hueco), la ilustración rotulada de HuecoFoto y el mismo Slider.
 */
export function DeslizadorAntesDespues({ par }: DeslizadorAntesDespuesProps) {
  const [posicion, setPosicion] = useState(50);
  const recorte = `recorte${useId()}`;
  const cintas = (
    <HStack gap={2} justify="between" vAlign="center">
      <CintaEtiqueta>Antes</CintaEtiqueta>
      <CintaEtiqueta>Después</CintaEtiqueta>
    </HStack>
  );
  const conFotos = !par.hueco && par.antes && par.despues;
  return (
    <VStack gap={3}>
      {conFotos ? (
        <Overlay scrim={false} position="top" align="start" content={cintas}>
          <AspectRatio ratio={4 / 3} fit="cover">
            <svg
              viewBox={`0 0 ${ANCHO} ${ALTO}`}
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <clipPath id={recorte}>
                  <rect x={0} y={0} width={posicion} height={ALTO} />
                </clipPath>
              </defs>
              <g role="img" aria-label={par.alt_antes}>
                <title>{par.alt_antes}</title>
                <image href={par.antes!} x={0} y={0} width={ANCHO} height={ALTO} preserveAspectRatio="xMidYMid slice" />
              </g>
              <g role="img" aria-label={par.alt_despues}>
                <title>{par.alt_despues}</title>
                <image
                  clipPath={`url(#${recorte})`}
                  href={par.despues!}
                  x={0}
                  y={0}
                  width={ANCHO}
                  height={ALTO}
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>
              <g aria-hidden="true">
                <line x1={posicion} y1={0} x2={posicion} y2={ALTO} stroke={ASA} strokeWidth={1} />
                <circle cx={posicion} cy={ALTO / 2} r={4} fill={ASA} stroke={ASA_BORDE} strokeWidth={0.5} />
              </g>
            </svg>
          </AspectRatio>
        </Overlay>
      ) : (
        <>
          {cintas}
          <HuecoFoto par={par} lado="despues" />
        </>
      )}
      <Slider
        label="Comparar antes y después"
        isLabelHidden
        valueDisplay="none"
        min={0}
        max={100}
        value={posicion}
        onChange={(v: number) => setPosicion(v)}
        formatValue={(v) => `${v} %`}
      />
    </VStack>
  );
}
