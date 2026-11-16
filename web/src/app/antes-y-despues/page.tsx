import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Metadata } from 'next';
import { cargarGaleria, cargarNegocio, cargarServicios, type Negocio, type ParGaleria, type Servicio } from '../../lib/content';
import { serviciosConPares } from '../../lib/galeria';
import { APP_NAME, canonicalUrl } from '../../lib/site';
import { MENSAJE_PORTADA } from '../../lib/whatsapp';
import { BotonWhatsApp } from '../../ui/BotonWhatsApp';
import { FiltroGaleria } from '../../ui/FiltroGaleria';

/** Título de main (exacto) y canonical de url_base, como el resto de páginas de PAGES. */
export function generateMetadata(): Metadata {
  return {
    title: `Antes y después · ${APP_NAME}`,
    description:
      'Mira cómo quedan los platos de ducha y las bañeras antes y después de repararlos en casa, sin obras. Filtra por servicio.',
    alternates: { canonical: canonicalUrl(cargarNegocio().url_base, '/antes-y-despues/') },
  };
}

export interface AntesYDespuesProps {
  pares: ParGaleria[];
  servicios: Pick<Servicio, 'slug' | 'nombre'>[];
  negocio: Negocio;
}

/**
 * Página /antes-y-despues/: los pares de galeria.json con filtro por servicio (FiltroGaleria) y, al final, la
 * foto por WhatsApp como único botón primario. Dentro del contenedor `portada` (margen lateral y ancho máximo).
 */
export function AntesYDespues({ pares, servicios, negocio }: AntesYDespuesProps) {
  const whatsapp = negocio.whatsapp.valor;
  return (
    <VStack gap={6} className="portada portada-galeria">
      <VStack gap={3}>
        <Heading level={1}>Antes y después</Heading>
        <Text as="p" type="large">
          Así quedan los platos de ducha y las bañeras que reparamos en casa. Elige un servicio para ver solo esos trabajos.
        </Text>
      </VStack>
      <FiltroGaleria pares={pares} servicios={serviciosConPares(pares, servicios)} />
      <VStack gap={3} hAlign="start">
        <Text as="p">¿El tuyo tiene arreglo? Mándanos una foto por WhatsApp</Text>
        {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={MENSAJE_PORTADA} etiqueta="Manda la foto del tuyo" /> : null}
      </VStack>
    </VStack>
  );
}

export default function AntesYDespuesPage() {
  return <AntesYDespues pares={cargarGaleria()} servicios={cargarServicios()} negocio={cargarNegocio()} />;
}
