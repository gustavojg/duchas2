'use client';

import { AspectRatio } from '@astryxdesign/core/AspectRatio';
import { HStack } from '@astryxdesign/core/HStack';
import { Overlay } from '@astryxdesign/core/Overlay';
import { Slider } from '@astryxdesign/core/Slider';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { type ReactNode, useId, useState } from 'react';
import type { ParGaleria } from '../lib/content';
import { PlatoPartido } from './art';
import { CintaEtiqueta } from './CintaEtiqueta';

/** Lienzo del SVG en unidades de usuario: 100 de ancho = la posición del Slider (0-100); 4:3. */
const ANCHO = 100;
const ALTO = 75;
const ASA = 'var(--color-background-card)';
const ASA_BORDE = 'var(--color-text-primary)';
/** Opacidad de la capa de abajo cuando es la misma ilustración: se distingue de la recortada. */
export const VELO = 0.6;
/** Altura del asa: tercio superior, para no tapar el desagüe de PlatoPartido (hacia y≈45 de 75). */
export const ASA_CY = ALTO / 3;

export interface DeslizadorAntesDespuesProps {
  par: ParGaleria;
}

/**
 * Comparador antes/después (docs/astryx-componentes.md, fila «deslizador antes/después»). Un Slider de Astryx
 * (arrastre táctil y flechas, con aria-valuenow) mueve la posición 0-100. Overlay (cintas «ANTES»/«DESPUÉS»)
 * + AspectRatio 4:3 + un <svg viewBox="0 0 100 75">: la capa de abajo, la de arriba recortada con un
 * <clipPath> cuyo <rect> va de la posición al borde derecho (atributos SVG, sin estilo en línea), y el asa en el borde.
 * Con fotos, «antes» debajo y «después» encima. Sin fotos (hueco), la ilustración de art.tsx en las dos capas
 * (la de abajo velada), rotulada «ILUSTRACIÓN», con el aviso y el texto del hueco una sola vez, debajo.
 */
export function DeslizadorAntesDespues({ par }: DeslizadorAntesDespuesProps) {
  const [posicion, setPosicion] = useState(50);
  const recorte = `recorte${useId()}`;
  const conFotos = Boolean(!par.hueco && par.antes && par.despues);
  const cintas = (
    <HStack gap={2} justify="between" vAlign="center" className="deslizador-cintas">
      <CintaEtiqueta>Antes</CintaEtiqueta>
      <CintaEtiqueta>Después</CintaEtiqueta>
    </HStack>
  );
  const capa = (lado: 'antes' | 'despues', clip?: string): ReactNode => {
    const alt = lado === 'antes' ? par.alt_antes : par.alt_despues;
    if (conFotos) {
      return (
        <>
          <title>{alt}</title>
          <image clipPath={clip} href={par[lado]!} x={0} y={0} width={ANCHO} height={ALTO} preserveAspectRatio="xMidYMid slice" />
        </>
      );
    }
    // El <svg> de art.tsx anidado ocupa el lienzo entero (4:3 sobre 4:3).
    return (
      <g clipPath={clip}>
        <PlatoPartido title={alt} sinCinta />
      </g>
    );
  };
  return (
    <VStack gap={3}>
      {conFotos ? null : <CintaEtiqueta>Ilustración</CintaEtiqueta>}
      <VStack gap={2}>
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
                  {/* La capa «después» se ve a la derecha del asa, bajo la cinta «DESPUÉS». */}
                  <rect x={posicion} y={0} width={ANCHO - posicion} height={ALTO} />
                </clipPath>
              </defs>
              {/* Con ilustración, el <svg> de art.tsx ya lleva role="img" y su título. */}
              <g role={conFotos ? 'img' : undefined} aria-label={conFotos ? par.alt_antes : undefined} opacity={conFotos ? undefined : VELO}>
                {capa('antes')}
              </g>
              <g role={conFotos ? 'img' : undefined} aria-label={conFotos ? par.alt_despues : undefined}>
                {capa('despues', `url(#${recorte})`)}
              </g>
              <g aria-hidden="true">
                <line x1={posicion} y1={0} x2={posicion} y2={ALTO} stroke={ASA} strokeWidth={1} />
                <circle cx={posicion} cy={ASA_CY} r={4} fill={ASA} stroke={ASA_BORDE} strokeWidth={0.5} />
              </g>
            </svg>
          </AspectRatio>
        </Overlay>
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
      {conFotos ? null : (
        <VStack gap={1}>
          <Text as="p">Pronto, fotos reales de este trabajo</Text>
          {par.hueco ? (
            <Text as="p" type="supporting">
              {par.hueco}
            </Text>
          ) : null}
        </VStack>
      )}
    </VStack>
  );
}
