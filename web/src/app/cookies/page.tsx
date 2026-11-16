import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { cargarNegocio } from '../../lib/content';
import { metadataPagina } from '../../lib/seo';
import { APP_NAME } from '../../lib/site';
import { PaginaTexto } from '../../ui/PaginaTexto';

export const metadata = metadataPagina({
  ruta: '/cookies/',
  titulo: 'Cookies',
  descripcion: 'Qué cookies usa esta web, para qué sirven y cómo cambiar tu elección.',
  baseUrl: cargarNegocio().url_base,
  nombreSitio: APP_NAME,
});

/**
 * Política de cookies (LSSI art. 22). Sin `ga4Id` (negocio.json › analitica) la web no usa cookies de análisis
 * ni publicidad; con él, GA4 solo se activa si aceptas en el banner. Texto base: revisar antes de publicar.
 */
export function Cookies({ ga4Id }: { ga4Id: string | null }) {
  return (
    <PaginaTexto titulo="Cookies">
      {ga4Id ? (
        <>
          <VStack gap={2} as="section">
            <Heading level={2}>Qué usamos</Heading>
            <Text as="p">No usamos cookies de publicidad.</Text>
            <Text as="p">Para saber cuánta gente visita la web usamos Google Analytics 4.</Text>
            <Text as="p">Solo se activa si pulsas «Aceptar» en el aviso de cookies.</Text>
            <Text as="p">Si pulsas «Rechazar», no se carga nada de Google.</Text>
          </VStack>
          <VStack gap={2} as="section">
            <Heading level={2}>Dónde se guarda tu elección</Heading>
            <Text as="p">Tu elección se guarda en tu navegador (localStorage), no en nuestros equipos.</Text>
            <Text as="p">Así no te volvemos a preguntar en cada visita.</Text>
          </VStack>
          <VStack gap={2} as="section">
            <Heading level={2}>Cómo cambiar tu elección</Heading>
            <Text as="p">Borra los datos de este sitio en los ajustes de tu navegador.</Text>
            <Text as="p">La próxima vez que entres te volveremos a preguntar.</Text>
          </VStack>
        </>
      ) : (
        <VStack gap={2} as="section">
          <Heading level={2}>Qué usamos</Heading>
          <Text as="p">No usamos cookies de análisis ni de publicidad.</Text>
          <Text as="p">Esta web no te sigue ni guarda nada en tu navegador para medirte.</Text>
          <Text as="p">Si algún día lo cambiamos, te pediremos permiso antes.</Text>
        </VStack>
      )}
    </PaginaTexto>
  );
}

export default function Page() {
  return <Cookies ga4Id={cargarNegocio().analitica.ga4_id} />;
}
