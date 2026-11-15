import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { type ConfigFormulario, configFormulario } from '../lib/config';
import { cargarNegocio, type Negocio } from '../lib/content';
import { type Modo, modoActual } from '../lib/dato';
import { metadataPagina } from '../lib/seo';
import { APP_NAME, DESCRIPTION } from '../lib/site';
import { compromisosFranja, titularPortada } from '../lib/textos';
import { telLink } from '../lib/whatsapp';
import { PlatoPartido } from '../ui/art';
import { BotonLlamar } from '../ui/BotonLlamar';
import { BotonWhatsApp } from '../ui/BotonWhatsApp';
import { CintaEtiqueta } from '../ui/CintaEtiqueta';
import { FranjaConfianza } from '../ui/FranjaConfianza';

export const metadata = metadataPagina({
  ruta: '/',
  titulo: 'Reparación y esmaltado de platos de ducha en Madrid',
  descripcion: DESCRIPTION,
  baseUrl: cargarNegocio().url_base,
  nombreSitio: APP_NAME,
});

const MENSAJE_WHATSAPP = 'Hola, os mando una foto del daño para que me digáis si tiene arreglo.';

export interface PortadaProps {
  negocio: Negocio;
  config: ConfigFormulario;
  modo: Modo;
}

/**
 * Portada `/` (brain/design.md § Portada): hero con cinta, H1 de beneficio, subtítulo, la acción principal
 * (WhatsApp) + «Llamar» con la retención de la foto junto al botón, y el plato partido; debajo, la franja de
 * confianza (compromisos de textos.compromisosFranja()). Los botones van antes de la ilustración para que
 * en 360 × 740 se vean sin scroll. Todos los plazos y cifras salen de textos.ts con el contenido que recibe por props (los tests inyectan el suyo).
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
          {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={MENSAJE_WHATSAPP} etiqueta="Manda la foto por WhatsApp" /> : null}
          {telefono ? <BotonLlamar href={telLink(telefono)} etiqueta="Llamar" /> : null}
        </HStack>
        <Text type="supporting" as="p">
          {`Tu foto solo la vemos nosotros y se borra a los ${config.retencion_dias} días`}
        </Text>
        <Card padding={0}>
          <PlatoPartido />
        </Card>
      </VStack>
      <FranjaConfianza compromisos={compromisosFranja(negocio, modo)} />
    </VStack>
  );
}

export default function Home() {
  return <Portada negocio={cargarNegocio()} config={configFormulario()} modo={modoActual()} />;
}
