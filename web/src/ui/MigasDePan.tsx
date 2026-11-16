import { HStack } from '@astryxdesign/core/HStack';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import type { Miga } from '../lib/seo';

export interface MigasDePanProps {
  /** De «Inicio» (`/`) a la página actual, que va la última. La misma lista alimenta jsonLdBreadcrumbList(). */
  migas: Miga[];
}

/**
 * Migas de pan (brain/design.md § Platos de ducha y plantilla de servicio): `<nav aria-label="Migas de pan">`
 * con una lista ordenada (HStack `as="ol"`/`"li"`). Cada miga es un Link salvo la última, la página actual,
 * que es Text y lleva aria-current="page" en su `li`. El separador «›» es decorativo (aria-hidden). Componente
 * de servidor, registrado en docs/astryx-componentes.md. La página pasa la misma lista al JSON-LD
 * BreadcrumbList para que lo visible y los datos estructurados coincidan.
 */
export function MigasDePan({ migas }: MigasDePanProps) {
  return (
    <nav aria-label="Migas de pan">
      <HStack as="ol" gap={2} wrap="wrap" vAlign="center">
        {migas.map((m, i) => {
          const actual = i === migas.length - 1;
          return (
            <HStack as="li" key={m.ruta} gap={2} vAlign="center" aria-current={actual ? 'page' : undefined}>
              {actual ? (
                <Text type="supporting">{m.nombre}</Text>
              ) : (
                <>
                  <Link href={m.ruta}>{m.nombre}</Link>
                  <Text type="supporting" aria-hidden="true">
                    ›
                  </Text>
                </>
              )}
            </HStack>
          );
        })}
      </HStack>
    </nav>
  );
}
