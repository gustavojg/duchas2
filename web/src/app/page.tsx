import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { type ConfigFormulario, configFormulario } from '../lib/config';
import { cargarNegocio, type Negocio } from '../lib/content';
import { type Modo, modoActual } from '../lib/dato';
import { DESCRIPTION } from '../lib/site';
import { anios, garantia, titularPortada } from '../lib/textos';
import { telLink } from '../lib/whatsapp';
import { PlatoPartido } from '../ui/art';
import { BotonLlamar } from '../ui/BotonLlamar';
import { BotonWhatsApp } from '../ui/BotonWhatsApp';
import { CintaEtiqueta } from '../ui/CintaEtiqueta';
import { FranjaConfianza } from '../ui/FranjaConfianza';

const MENSAJE_WHATSAPP = 'Hola, os mando una foto del daño para que me digáis si tiene arreglo.';

export interface PortadaProps {
  negocio: Negocio;
  config: ConfigFormulario;
  modo: Modo;
}

/**
 * Portada `/` (brain/design.md § Portada): hero con cinta, H1 de beneficio, subtítulo, plato partido, la
 * acción principal (WhatsApp) + «Llamar» y la retención de la foto; debajo, la franja de confianza. Todos los
 * plazos y cifras salen de textos.ts con el contenido que recibe por props (los tests inyectan el suyo).
 */
export function Portada({ negocio, config, modo }: PortadaProps) {
  const whatsapp = negocio.whatsapp.valor;
  const telefono = negocio.telefono.valor;
  return (
    <VStack gap={6}>
      <VStack gap={4} as="section" aria-labelledby="portada-titulo">
        <CintaEtiqueta>Madrid · Platos de ducha, bañeras y azulejos</CintaEtiqueta>
        <Heading level={1} id="portada-titulo">
          {titularPortada(negocio.plazos.reparacion, modo)}
        </Heading>
        <Text type="large" as="p">
          {DESCRIPTION}
        </Text>
        <Card padding={0}>
          <PlatoPartido />
        </Card>
        <HStack gap={2} wrap="wrap" vAlign="center">
          {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={MENSAJE_WHATSAPP} etiqueta="Manda la foto por WhatsApp" /> : null}
          {telefono ? <BotonLlamar href={telLink(telefono)} etiqueta="Llamar" /> : null}
        </HStack>
        <Text type="supporting" as="p">
          {`Tu foto solo la vemos nosotros y se borra a los ${config.retencion_dias} días`}
        </Text>
      </VStack>
      <FranjaConfianza
        compromisos={[
          { tipo: 'garantia', texto: garantia(negocio.garantia.anios, modo) },
          { tipo: 'sin-obras', texto: 'Sin obras ni polvo' },
          { tipo: 'un-telefono', texto: 'Un solo teléfono, siempre el mismo' },
          { tipo: 'hoteles', texto: 'Trabajamos para hoteles y comunidades' },
        ]}
        anios={anios(negocio.anios, modo)}
      />
    </VStack>
  );
}

export default function Home() {
  return <Portada negocio={cargarNegocio()} config={configFormulario()} modo={modoActual()} />;
}
