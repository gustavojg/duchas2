import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { cargarNegocio, type Negocio } from '../../lib/content';
import { confirmado, type Modo, modoActual, texto } from '../../lib/dato';
import { metadataPagina } from '../../lib/seo';
import { APP_NAME } from '../../lib/site';
import { PaginaTexto } from '../../ui/PaginaTexto';

export const metadata = metadataPagina({
  ruta: '/aviso-legal/',
  titulo: 'Aviso legal',
  descripcion: 'Quién está detrás de esta web, cómo contactar y las condiciones para usarla.',
  baseUrl: cargarNegocio().url_base,
  nombreSitio: APP_NAME,
});

export interface AvisoLegalProps {
  negocio: Negocio;
  modo: Modo;
}

/**
 * Aviso legal (LSSI, art. 10): titular, NIF, domicilio y contacto, condiciones de uso, propiedad intelectual y
 * ley aplicable. Los datos salen de negocio.json con texto() de lib/dato: sin confirmar, «por confirmar» en
 * público y {{PENDIENTE}} en local. Texto base redactado sin asesoramiento jurídico: revisar antes de publicar.
 */
export function AvisoLegal({ negocio, modo }: AvisoLegalProps) {
  const dato = (d: Negocio['legal']['nif']) => texto(d, modo, { alternativo: 'por confirmar' });
  const marca = negocio.marca.valor ?? APP_NAME;
  const telefono = negocio.telefono.valor;
  return (
    <PaginaTexto titulo="Aviso legal">
      <Text as="p">{`Aquí tienes quién está detrás de ${marca} y las condiciones para usar esta web.`}</Text>
      <VStack gap={2} as="section">
        <Heading level={2}>Quién es el titular</Heading>
        <Text as="p">{`Titular: ${dato(negocio.legal.razon_social)}`}</Text>
        <Text as="p">{`NIF: ${dato(negocio.legal.nif)}`}</Text>
        <Text as="p">{`Domicilio: ${dato(negocio.legal.domicilio)}`}</Text>
        {telefono ? <Text as="p">{`Teléfono: ${telefono}`}</Text> : null}
        {confirmado(negocio.email) ? <Text as="p">{`Email: ${negocio.email.valor}`}</Text> : null}
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Condiciones de uso</Heading>
        <Text as="p">Esta web sirve para contarte qué hacemos y para que nos pidas presupuesto.</Text>
        <Text as="p">Al usarla, aceptas hacerlo de buena fe y sin dañar la web ni a otras personas.</Text>
        <Text as="p">Cuidamos que la información sea correcta, pero puede cambiar sin aviso.</Text>
        <Text as="p">Los precios y plazos solo valen cuando te los confirmamos por escrito.</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Propiedad intelectual</Heading>
        <Text as="p">Los textos, ilustraciones y fotos de esta web son del titular o tiene permiso para usarlos.</Text>
        <Text as="p">No los copies ni los publiques en otro sitio sin pedirnos permiso.</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Ley aplicable</Heading>
        <Text as="p">Esta web se rige por la ley española.</Text>
        <Text as="p">Si hay un desacuerdo, primero intentamos resolverlo hablando contigo.</Text>
        <Text as="p">Si no es posible, deciden los juzgados que marque la ley.</Text>
      </VStack>
    </PaginaTexto>
  );
}

export default function Page() {
  return <AvisoLegal negocio={cargarNegocio()} modo={modoActual()} />;
}
