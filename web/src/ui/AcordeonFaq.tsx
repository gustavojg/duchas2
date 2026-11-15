'use client';

import { Collapsible, CollapsibleGroup } from '@astryxdesign/core/Collapsible';
import { Text } from '@astryxdesign/core/Text';

export interface AcordeonFaqProps {
  /** Preguntas con la respuesta ya resuelta por faq.ts (sin marcadores). */
  preguntas: { p: string; r: string }[];
  /** Prefijo de los `value` de cada desplegable; único por página si hay varios acordeones. */
  idBase?: string;
}

/**
 * Acordeón de la FAQ (docs/astryx-componentes.md, fila «acordeón»): Collapsible dentro de CollapsibleGroup,
 * todos cerrados al principio. El disparador es el botón nativo de Collapsible (clic, Enter y Espacio, con
 * aria-expanded); la respuesta es un párrafo. Cliente porque Collapsible guarda el estado abierto.
 */
export function AcordeonFaq({ preguntas, idBase = 'faq' }: AcordeonFaqProps) {
  return (
    <CollapsibleGroup type="single" hasDividers>
      {preguntas.map((q, i) => (
        <Collapsible key={`${idBase}-${i}`} value={`${idBase}-${i}`} trigger={q.p} defaultIsOpen={false}>
          <Text as="p">{q.r}</Text>
        </Collapsible>
      ))}
    </CollapsibleGroup>
  );
}
