import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { cargarNegocio, type Negocio } from '../../lib/content';
import { type Modo, modoActual, texto } from '../../lib/dato';
import { metadataPagina } from '../../lib/seo';
import { APP_NAME } from '../../lib/site';
import { anios, garantia } from '../../lib/textos';
import { PaginaTexto } from '../../ui/PaginaTexto';

export const metadata = metadataPagina({
  ruta: '/quienes-somos/',
  titulo: 'Quiénes somos',
  descripcion: 'Cómo trabajamos: sin obras ni polvo, primero tu foto y luego el presupuesto, con garantía por escrito.',
  baseUrl: cargarNegocio().url_base,
  nombreSitio: APP_NAME,
});

export interface QuienesSomosProps {
  negocio: Negocio;
  modo: Modo;
}

/**
 * Quiénes somos (brain/design.md: confianza): forma de trabajar y garantía. Años y plazo de garantía salen de
 * textos.ts; sin confirmar, los años no aparecen y la garantía va sin plazo.
 */
export function QuienesSomos({ negocio, modo }: QuienesSomosProps) {
  const marca = negocio.marca.valor ?? APP_NAME;
  const lineaAnios = anios(negocio.anios, modo);
  const condiciones = texto(negocio.garantia.condiciones, modo, { alternativo: '' });
  return (
    <PaginaTexto titulo={`Quiénes somos en ${marca}`}>
      <Text as="p" type="large">Reparamos y esmaltamos platos de ducha, bañeras y azulejos en Madrid.</Text>
      {lineaAnios ? <Text as="p" weight="semibold">{lineaAnios}</Text> : null}
      <VStack gap={2} as="section">
        <Heading level={2}>Cómo trabajamos</Heading>
        <Text as="p">Trabajamos en tu baño, sin obras ni polvo.</Text>
        <Text as="p">Primero nos mandas una foto del daño.</Text>
        <Text as="p">Con la foto te decimos si tiene arreglo.</Text>
        <Text as="p">Te damos el presupuesto después de ver la foto, sin compromiso.</Text>
        <Text as="p">Reparamos el plato en vez de cambiarlo, y lo dejamos como nuevo.</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Garantía</Heading>
        <Text as="p" weight="semibold">{garantia(negocio.garantia.anios, modo)}</Text>
        {condiciones ? <Text as="p">{condiciones}</Text> : null}
      </VStack>
    </PaginaTexto>
  );
}

export default function Page() {
  return <QuienesSomos negocio={cargarNegocio()} modo={modoActual()} />;
}
