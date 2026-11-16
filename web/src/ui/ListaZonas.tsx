import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Zonas } from '../lib/content';
import { AnillosZonas } from './art';

export interface ListaZonasProps {
  /** Distritos y municipios de web/content/zonas.json. */
  zonas: Zonas;
}

/**
 * Zonas (brain/design.md § Portada, 10 y página /zonas/): esquema de anillos de art.tsx y dos grupos con H3
 * («Madrid capital», «Municipios del área metropolitana») en listas ul/li que envuelven. Sin Badge (es solo
 * para recuentos) y sin CTA: lo pone el padre. Composición registrada en docs/astryx-componentes.md; el
 * ancho del esquema sale de la clase `lista-zonas-anillos` de globals.css.
 */
export function ListaZonas({ zonas }: ListaZonasProps) {
  const grupos = [
    { titulo: 'Madrid capital', lista: zonas.madrid_capital },
    { titulo: 'Municipios del área metropolitana', lista: zonas.municipios },
  ];
  return (
    <VStack gap={4}>
      <VStack className="lista-zonas-anillos">
        <AnillosZonas />
      </VStack>
      {grupos.map((g) => (
        <VStack key={g.titulo} gap={2}>
          <Heading level={3}>{g.titulo}</Heading>
          <HStack as="ul" gap={3} wrap="wrap" aria-label={g.titulo}>
            {g.lista.map((z) => (
              <VStack as="li" key={z}>
                <Text>{z}</Text>
              </VStack>
            ))}
          </HStack>
        </VStack>
      ))}
    </VStack>
  );
}
