import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Metadata } from 'next';
import { APP_NAME, canonicalUrl } from '../../lib/site';
import { cargarNegocio, cargarZonas, type Negocio, type Zonas as ZonasContenido } from '../../lib/content';
import { BotonWhatsApp } from '../../ui/BotonWhatsApp';
import { ListaZonas } from '../../ui/ListaZonas';

const MENSAJE_ZONA = 'Hola, vivo en… ¿venís a mi zona?';

export function generateMetadata(): Metadata {
  return {
    title: `Zonas donde reparamos en Madrid · ${APP_NAME}`,
    description:
      'Reparamos platos de ducha, bañeras y azulejos en Madrid capital y en los municipios del área metropolitana. Pregúntanos por tu zona.',
    alternates: { canonical: canonicalUrl(cargarNegocio().url_base, '/zonas/') },
  };
}

export interface ZonasProps {
  negocio: Negocio;
  zonas: ZonasContenido;
}

/**
 * Página /zonas/ (brain/design.md § Soporte, Zonas): anillos + distritos + municipios de zonas.json, y la
 * pregunta por WhatsApp como único botón primario. Sin páginas por barrio. Dentro del contenedor `portada`
 * (margen lateral y ancho máximo).
 */
export function Zonas({ negocio, zonas }: ZonasProps) {
  const whatsapp = negocio.whatsapp.valor;
  return (
    <VStack gap={6} className="portada">
      <VStack gap={3}>
        <Heading level={1}>Zonas donde reparamos en Madrid</Heading>
        <Text as="p" type="large">
          Vamos a tu casa en Madrid capital y en el área metropolitana. Reparamos en tu baño, sin obras.
        </Text>
      </VStack>
      <ListaZonas zonas={zonas} />
      <VStack gap={3} hAlign="start">
        <Text as="p">¿No ves tu zona? Pregúntanos por WhatsApp</Text>
        {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={MENSAJE_ZONA} etiqueta="Pregunta por tu zona" /> : null}
      </VStack>
    </VStack>
  );
}

export default function ZonasPage() {
  return <Zonas negocio={cargarNegocio()} zonas={cargarZonas()} />;
}
