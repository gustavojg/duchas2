import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Resena } from '../lib/content';
import { notaVisible, resumenResenas } from '../lib/seo';

/**
 * Bloque de reseñas (brain/design.md § Portada, 8): nota media en mono, número de opiniones y la lista. Sin
 * reseñas no existe (devuelve null). La nota sale de resumenResenas(), la misma que usa AggregateRating.
 * Composición registrada en docs/astryx-componentes.md: VStack (section/ul/li) + Heading + Text type code.
 */
export function BloqueResenas({ resenas }: { resenas: Resena[] }) {
  const resumen = resumenResenas(resenas);
  if (!resumen) return null;
  const opiniones = resumen.total === 1 ? '1 opinión' : `${resumen.total} opiniones`;
  return (
    <VStack gap={4} as="section" aria-labelledby="resenas-titulo">
      <Heading level={2} id="resenas-titulo">
        Lo que dicen de nosotros
      </Heading>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Text type="code" weight="bold">{`${notaVisible(resumen.media)} / 5`}</Text>
        <Text type="supporting">{opiniones}</Text>
      </HStack>
      <VStack gap={3} as="ul" aria-label="Opiniones">
        {resenas.map((r) => (
          <VStack gap={1} as="li" key={`${r.autor}-${r.fecha}`}>
            <Text as="p">{r.texto}</Text>
            <Text as="p" type="supporting">{`${r.autor} · ${r.fuente}`}</Text>
          </VStack>
        ))}
      </VStack>
    </VStack>
  );
}
