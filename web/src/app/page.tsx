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
import { MENSAJE_PORTADA, telLink } from '../lib/whatsapp';
import { PlatoPartido } from '../ui/art';
import { BotonLlamar } from '../ui/BotonLlamar';
import { BotonWhatsApp } from '../ui/BotonWhatsApp';
import { CintaEtiqueta } from '../ui/CintaEtiqueta';
import { FranjaConfianza } from '../ui/FranjaConfianza';

export interface PortadaProps {
  negocio: Negocio;
  config: ConfigFormulario;
  modo: Modo;
}

/**
 * Portada `/` (brain/design.md § Portada): hero con cinta, H1 de beneficio, subtítulo, la acción principal
 * (WhatsApp) + «Llamar» con la retención de la foto junto al botón, y el plato partido; debajo, la franja de
 * confianza. Los botones van antes de la ilustración para que en 360 × 740 se vean sin scroll. Todos los
 * plazos y cifras salen de textos.ts con el contenido que recibe por props (los tests inyectan el suyo).
 */
export function Portada({ negocio, config, modo }: PortadaProps) {
  const whatsapp = negocio.whatsapp.valor;
  const telefono = negocio.telefono.valor;
  return (
    <VStack gap={6} className="portada">
      <VStack gap={4} as="section" aria-labelledby="portada-titulo">
        <CintaEtiqueta>Madrid · Platos de ducha, bañeras y azulejos</CintaEtiqueta>
        <Heading level={1} id="portada-titulo">
          {titularPortada(negocio.plazos.reparacion, modo)}
        </Heading>
        <Text type="large" as="p">
          {DESCRIPTION}
        </Text>
        <HStack gap={2} wrap="wrap" vAlign="center">
          {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={MENSAJE_PORTADA} etiqueta="Manda la foto por WhatsApp" /> : null}
          {telefono ? <BotonLlamar href={telLink(telefono)} etiqueta="Llamar" /> : null}
        </HStack>
        <Text type="supporting" as="p">
          {`Tu foto solo la vemos nosotros y se borra a los ${config.retencion_dias} días`}
        </Text>
        <Card padding={0}>
          <PlatoPartido />
        </Card>
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
