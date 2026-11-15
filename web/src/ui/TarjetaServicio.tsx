import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Servicio } from '../lib/content';
import { IconoServicio } from './art';

export interface TarjetaServicioProps {
  /** Un servicio de web/content/servicios.json. */
  servicio: Servicio;
  /** Tarjeta grande; por defecto, la del servicio principal (el plato de ducha). */
  grande?: boolean;
}

/**
 * Tarjeta de servicio (brain/design.md § Portada, 6): ClickableCard de Astryx que enlaza a `servicio.ruta`,
 * con el icono de `imagen_tarjeta`, el nombre en H3 y el resumen. La del plato es grande (icono y texto
 * mayores, en columna) y las demás compactas (icono al lado). No muestra precio. Composición registrada en
 * docs/astryx-componentes.md; el ancho del icono sale de la clase `tarjeta-servicio-icono` de globals.css.
 */
export function TarjetaServicio({ servicio, grande = servicio.tipo === 'principal' }: TarjetaServicioProps) {
  const tamano = grande ? 'grande' : 'compacta';
  const icono = (
    <VStack className="tarjeta-servicio-icono" data-tamano={tamano}>
      <IconoServicio tipo={servicio.imagen_tarjeta} decorative />
    </VStack>
  );
  const textos = (
    <VStack gap={grande ? 2 : 1}>
      <Heading level={3} type={grande ? 'display-3' : undefined} weight="bold">
        {servicio.nombre}
      </Heading>
      <Text as="p" type={grande ? 'large' : 'body'} color="secondary">
        {servicio.resumen}
      </Text>
    </VStack>
  );
  return (
    <ClickableCard label={servicio.nombre} href={servicio.ruta} padding={grande ? 6 : 4}>
      {grande ? (
        <VStack gap={4} data-tamano={tamano}>
          {icono}
          {textos}
        </VStack>
      ) : (
        <HStack gap={3} vAlign="start" data-tamano={tamano}>
          {icono}
          {textos}
        </HStack>
      )}
    </ClickableCard>
  );
}
