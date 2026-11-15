import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { PasoResuelto } from '../lib/catalogo';
import { BotonWhatsApp } from './BotonWhatsApp';

export interface PasosTrabajoProps {
  /** Pasos ya resueltos por resolverPasos() (textos con plazo solo si está confirmado). */
  pasos: PasoResuelto[];
  /** Número de WhatsApp de negocio.json; sin él, el paso con acción no pinta botón. */
  whatsapp: string | null;
  /** Mensaje prellenado del paso con acción de WhatsApp (pasos.json). */
  mensaje: string;
}

/**
 * «Cómo trabajamos» (brain/design.md § Portada, 5): lista ordenada de pasos con «PASO N» en la cinta (Text
 * mono + clase `paso-numero` de globals.css, solo var(--color-tape) y var(--color-on-tape)). El paso con
 * acción `whatsapp` pinta un BotonWhatsApp secundario: el primario de la portada es el del hero. No escribe
 * plazos: los recibe resueltos. Composición registrada en docs/astryx-componentes.md.
 */
export function PasosTrabajo({ pasos, whatsapp, mensaje }: PasosTrabajoProps) {
  return (
    <VStack as="ol" gap={6} aria-label="Pasos para reparar tu baño">
      {pasos.map((p) => (
        <VStack as="li" key={p.numero} gap={2}>
          <Text as="p" type="code" weight="bold" color="inherit" className="paso-numero">
            {`PASO ${p.numero}`}
          </Text>
          <Heading level={3}>{p.titulo}</Heading>
          <Text as="p">{p.texto}</Text>
          {p.accion === 'whatsapp' && whatsapp ? (
            <VStack hAlign="start">
              <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta="Escríbenos por WhatsApp" variante="secondary" />
            </VStack>
          ) : null}
        </VStack>
      ))}
    </VStack>
  );
}
