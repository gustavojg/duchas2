import { Text } from '@astryxdesign/core/Text';
import type { Dato } from '../lib/content';
import { confirmado, type Modo } from '../lib/dato';
import { precioDesde } from '../lib/textos';

export interface PrecioDesdeProps {
  /** `precio_desde` de un servicio de web/content/servicios.json. */
  dato: Dato<number>;
  modo: Modo;
}

/**
 * Precio «desde» (brain/design.md § Cifras): el texto sale de textos.precioDesde(). La cifra confirmada (> 0)
 * va en mono (Text type="code"); si no, «Pide presupuesto gratuito» en texto normal. Nunca pinta «0».
 * Composición registrada en docs/astryx-componentes.md.
 */
export function PrecioDesde({ dato, modo }: PrecioDesdeProps) {
  const texto = precioDesde(dato, modo);
  if (confirmado(dato) && dato.valor > 0) {
    return (
      <Text as="p" type="code" size="xl" weight="bold">
        {texto}
      </Text>
    );
  }
  return <Text as="p">{texto}</Text>;
}
