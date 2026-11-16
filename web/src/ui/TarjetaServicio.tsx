import { Card } from '@astryxdesign/core/Card';
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Servicio } from '../lib/content';
import { rutaGenerada } from '../lib/paginas';
import { IconoServicio } from './art';

export interface TarjetaServicioProps {
  /** Un servicio de web/content/servicios.json. */
  servicio: Servicio;
  /** Tarjeta grande; por defecto, la del servicio principal (el plato de ducha). */
  grande?: boolean;
  /** Enlazar a `servicio.ruta`; por defecto, solo si el build genera esa página (rutaGenerada). */
  enlazar?: boolean;
}

/**
 * Tarjeta de servicio (brain/design.md § Portada, 6): ClickableCard de Astryx que enlaza a `servicio.ruta`
 * cuando el build genera esa página (rutaGenerada, que mira los page.tsx de web/src/app), y Card sin enlace
 * cuando aún no existe, para no publicar enlaces rotos. Lleva el icono de `imagen_tarjeta`, el nombre en H3 y
 * el resumen. La del plato es grande (icono y texto mayores) y las demás compactas (icono al lado). La grande
 * es un HStack con `wrap`: si el texto cabe con su ancho mínimo (`tarjeta-servicio-textos`) va al lado del
 * icono (escritorio, sin hueco junto a él); si no, baja debajo (móvil, en columna). No muestra precio.
 * Composición registrada en docs/astryx-componentes.md; los anchos salen de las clases
 * `tarjeta-servicio-icono` y `tarjeta-servicio-textos` de globals.css.
 */
export function TarjetaServicio({
  servicio,
  grande = servicio.tipo === 'principal',
  enlazar = rutaGenerada(servicio.ruta),
}: TarjetaServicioProps) {
  const tamano = grande ? 'grande' : 'compacta';
  const icono = (
    <VStack className="tarjeta-servicio-icono" data-tamano={tamano}>
      <IconoServicio tipo={servicio.imagen_tarjeta} decorative />
    </VStack>
  );
  const textos = (
    <VStack
      gap={grande ? 2 : 1}
      className={grande ? 'tarjeta-servicio-textos' : undefined}
      data-tamano={grande ? tamano : undefined}
    >
      <Heading level={3} type={grande ? 'display-3' : undefined} weight="bold">
        {servicio.nombre}
      </Heading>
      <Text as="p" type={grande ? 'large' : 'body'} color="secondary">
        {servicio.resumen}
      </Text>
    </VStack>
  );
  const contenido = grande ? (
    <HStack gap={4} wrap="wrap" vAlign="start" data-tamano={tamano}>
      {icono}
      {textos}
    </HStack>
  ) : (
    <HStack gap={3} vAlign="start" data-tamano={tamano}>
      {icono}
      {textos}
    </HStack>
  );
  const padding = grande ? 6 : 4;
  return enlazar ? (
    <ClickableCard label={servicio.nombre} href={servicio.ruta} padding={padding}>
      {contenido}
    </ClickableCard>
  ) : (
    <Card padding={padding}>{contenido}</Card>
  );
}
