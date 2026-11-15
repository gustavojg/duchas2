import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { type ConfigFormulario, configFormulario } from '../lib/config';
import {
  cargarFaq,
  cargarGaleria,
  cargarNegocio,
  cargarResenas,
  type Faq,
  type Negocio,
  type ParGaleria,
  type Resena,
} from '../lib/content';
import { type Modo, modoActual } from '../lib/dato';
import { preguntasResueltas } from '../lib/faq';
import { jsonLdLocalBusiness } from '../lib/seo';
import { DESCRIPTION } from '../lib/site';
import { anios, garantia, titularPortada } from '../lib/textos';
import { telLink, waLink } from '../lib/whatsapp';
import { AcordeonFaq } from '../ui/AcordeonFaq';
import { PlatoPartido } from '../ui/art';
import { BloqueResenas } from '../ui/BloqueResenas';
import { BotonLlamar } from '../ui/BotonLlamar';
import { BotonWhatsApp } from '../ui/BotonWhatsApp';
import { CintaEtiqueta } from '../ui/CintaEtiqueta';
import { DeslizadorAntesDespues } from '../ui/DeslizadorAntesDespues';
import { FranjaConfianza } from '../ui/FranjaConfianza';
import { HuecoFoto } from '../ui/HuecoFoto';
import { JsonLd } from '../ui/JsonLd';

const MENSAJE_WHATSAPP = 'Hola, os mando una foto del daño para que me digáis si tiene arreglo.';

export interface PortadaProps {
  negocio: Negocio;
  config: ConfigFormulario;
  modo: Modo;
  galeria: ParGaleria[];
  faq: Faq;
  resenas: Resena[];
}

/** Antes/después de la portada: el deslizador con el primer par de platos de ducha y 3 miniaturas más. */
function BloqueAntesDespues({ galeria, whatsapp }: { galeria: ParGaleria[]; whatsapp: string | null }) {
  const platos = galeria.filter((p) => p.servicio === 'platos-de-ducha');
  if (platos.length === 0) return null;
  const [principal, ...resto] = platos;
  return (
    <VStack gap={4} as="section" aria-labelledby="portada-antes-despues-titulo">
      <Heading level={2} id="portada-antes-despues-titulo">
        Antes y después
      </Heading>
      <DeslizadorAntesDespues par={principal} />
      {resto.length > 0 ? (
        <VStack gap={4} as="ul" aria-label="Más trabajos">
          {resto.slice(0, 3).map((par) => (
            <VStack as="li" key={par.alt_despues}>
              <HuecoFoto par={par} lado="despues" />
            </VStack>
          ))}
        </VStack>
      ) : null}
      <HStack gap={3} wrap="wrap" vAlign="center">
        <Link href="/antes-y-despues/">Ver todos los trabajos</Link>
        {whatsapp ? (
          <Button
            variant="secondary"
            size="lg"
            label="Manda la foto del tuyo"
            href={waLink(whatsapp, MENSAJE_WHATSAPP)}
            target="_blank"
            rel="noopener noreferrer"
          />
        ) : null}
      </HStack>
    </VStack>
  );
}

/** FAQ resumida: las preguntas con `en_portada`, resueltas con faq.ts, y el enlace a la página completa. */
function FaqResumida({ preguntas }: { preguntas: { p: string; r: string }[] }) {
  return (
    <VStack gap={4} as="section" aria-labelledby="portada-faq-titulo">
      <Heading level={2} id="portada-faq-titulo">
        Preguntas frecuentes
      </Heading>
      <AcordeonFaq preguntas={preguntas} idBase="portada-faq" />
      <Link href="/preguntas-frecuentes/">Todas las preguntas</Link>
    </VStack>
  );
}

/**
 * Portada `/` (brain/design.md § Portada): hero con cinta, H1 de beneficio, subtítulo, la acción principal
 * (WhatsApp) + «Llamar» con la retención de la foto junto al botón, y el plato partido; debajo, la franja de
 * confianza, el antes/después, las reseñas (si las hay), la FAQ resumida y el JSON-LD LocalBusiness. Los
 * botones van antes de la ilustración para que en 360 × 740 se vean sin scroll. Todos los plazos y cifras salen de textos.ts con el contenido que recibe por props (los tests inyectan el suyo).
 */
export function Portada({ negocio, config, modo, galeria, faq, resenas }: PortadaProps) {
  const whatsapp = negocio.whatsapp.valor;
  const telefono = negocio.telefono.valor;
  const enPortada = preguntasResueltas(faq, { negocio, retencion_dias: config.retencion_dias, modo })
    .flatMap((t) => t.preguntas)
    .filter((q) => q.en_portada);
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
      <FranjaConfianza
        compromisos={[
          { tipo: 'garantia', texto: garantia(negocio.garantia.anios, modo) },
          { tipo: 'sin-obras', texto: 'Sin obras ni polvo' },
          { tipo: 'un-telefono', texto: 'Un solo teléfono, siempre el mismo' },
          { tipo: 'hoteles', texto: 'Trabajamos para hoteles y comunidades' },
        ]}
        anios={anios(negocio.anios, modo)}
      />
      <BloqueAntesDespues galeria={galeria} whatsapp={whatsapp} />
      <BloqueResenas resenas={resenas} />
      <FaqResumida preguntas={enPortada} />
      <JsonLd data={jsonLdLocalBusiness({ negocio, resenas })} />
    </VStack>
  );
}

export default function Home() {
  return (
    <Portada
      negocio={cargarNegocio()}
      config={configFormulario()}
      modo={modoActual()}
      galeria={cargarGaleria()}
      faq={cargarFaq()}
      resenas={cargarResenas()}
    />
  );
}
