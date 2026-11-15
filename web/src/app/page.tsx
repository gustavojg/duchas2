import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { ReactNode } from 'react';
import { filasComparativa, resolverPasos, serviciosConPrecio, serviciosOrdenados } from '../lib/catalogo';
import { type ConfigFormulario, configFormulario } from '../lib/config';
import {
  cargarComparativa,
  cargarFaq,
  cargarGaleria,
  cargarNegocio,
  cargarPasos,
  cargarResenas,
  cargarServicios,
  cargarZonas,
  type Comparativa,
  type Faq,
  type Negocio,
  type ParGaleria,
  type Paso,
  type Resena,
  type Servicio,
  type Zonas,
} from '../lib/content';
import { type Modo, modoActual } from '../lib/dato';
import { preguntasResueltas } from '../lib/faq';
import { jsonLdLocalBusiness } from '../lib/seo';
import { DESCRIPTION } from '../lib/site';
import { compromisosFranja, respuesta, titularPortada } from '../lib/textos';
import { MENSAJE_PORTADA, telLink, waLink } from '../lib/whatsapp';
import { AcordeonFaq } from '../ui/AcordeonFaq';
import { PlatoPartido } from '../ui/art';
import { BloqueResenas } from '../ui/BloqueResenas';
import { BotonLlamar } from '../ui/BotonLlamar';
import { BotonWhatsApp } from '../ui/BotonWhatsApp';
import { CintaEtiqueta } from '../ui/CintaEtiqueta';
import { DeslizadorAntesDespues } from '../ui/DeslizadorAntesDespues';
import { EnviarContacto } from '../ui/EnviarContacto';
import { FranjaConfianza } from '../ui/FranjaConfianza';
import { HuecoFoto } from '../ui/HuecoFoto';
import { JsonLd } from '../ui/JsonLd';
import { ListaZonas } from '../ui/ListaZonas';
import { PasosTrabajo } from '../ui/PasosTrabajo';
import { PrecioDesde } from '../ui/PrecioDesde';
import { TablaRepararCambiar } from '../ui/TablaRepararCambiar';
import { TarjetaServicio } from '../ui/TarjetaServicio';

const MENSAJE_PRECIO = 'Hola, quiero saber cuánto costaría arreglar mi baño. Os mando una foto.';
const MENSAJE_ZONA = 'Hola, vivo en… ¿venís a mi zona?';
const NO_VES_TU_ZONA = '¿No ves tu zona? Pregúntanos por WhatsApp';

export interface PortadaProps {
  negocio: Negocio;
  config: ConfigFormulario;
  modo: Modo;
  servicios: Servicio[];
  pasos: Paso[];
  comparativa: Comparativa;
  zonas: Zonas;
  galeria: ParGaleria[];
  faq: Faq;
  resenas: Resena[];
}

/** Antes/después de la portada: el deslizador con el primer par de platos de ducha y 3 miniaturas más. */
function BloqueAntesDespues({ galeria, whatsapp }: { galeria: ParGaleria[]; whatsapp: string | null }) {
  const platos = galeria.filter((p) => p.servicio === 'platos-de-ducha');
  if (platos.length === 0) return null;
  const [principal, ...resto] = platos;
  const miniaturas = resto.slice(0, 3);
  // Las miniaturas compactas no llevan cinta propia: una sola encima avisa de que no son fotos reales.
  const hayIlustraciones = miniaturas.some((par) => !par.despues);
  return (
    <VStack gap={4} as="section" aria-labelledby="portada-antes-despues-titulo">
      <Heading level={2} id="portada-antes-despues-titulo">
        Antes y después
      </Heading>
      <DeslizadorAntesDespues par={principal} />
      {miniaturas.length > 0 ? (
        <VStack gap={2}>
          {hayIlustraciones ? <CintaEtiqueta>Ilustraciones</CintaEtiqueta> : null}
          <HStack gap={2} as="ul" aria-label="Más trabajos">
            {miniaturas.map((par) => (
              <VStack as="li" key={par.alt_despues} className="portada-miniatura">
                <HuecoFoto par={par} lado="despues" compacta />
              </VStack>
            ))}
          </HStack>
        </VStack>
      ) : null}
      <VStack gap={3}>
        {whatsapp ? (
          <Button
            variant="secondary"
            size="lg"
            label="Manda la foto del tuyo"
            href={waLink(whatsapp, MENSAJE_PORTADA)}
            target="_blank"
            rel="noopener noreferrer"
            className="portada-cta"
          />
        ) : null}
        <Link href="/antes-y-despues/">Ver todos los trabajos</Link>
      </VStack>
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

/** Sección de la portada con su H2 (el id enlaza el aria-labelledby). */
function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <VStack gap={4} as="section" aria-labelledby={id}>
      <Heading level={2} id={id}>
        {titulo}
      </Heading>
      {children}
    </VStack>
  );
}

/**
 * Portada `/` (brain/design.md § Portada): hero con cinta, H1 de beneficio, subtítulo, la acción principal
 * (WhatsApp) + «Llamar» con la retención de la foto junto al botón, y el plato partido; debajo, la franja de
 * confianza (compromisos de textos.compromisosFranja()), el antes/después y los módulos ¿Reparar o cambiar?,
 * Cómo trabajamos, Servicios, Precios orientativos, Reseñas (si las hay), FAQ resumida y Zonas; al final, el
 * formulario de contacto y el JSON-LD LocalBusiness.
 * Los botones van antes de la ilustración para que en 360 × 740 se vean sin scroll. Todos los plazos y
 * cifras salen de textos.ts y catalogo.ts con el contenido que recibe por props (los tests inyectan el suyo).
 * El único botón primario es el WhatsApp del hero; el resto son secundarios, salvo «Enviar petición» del
 * formulario (excepción aceptada por la spec).
 */
export function Portada({ negocio, config, modo, servicios, pasos, comparativa, zonas, galeria, faq, resenas }: PortadaProps) {
  const whatsapp = negocio.whatsapp.valor;
  const telefono = negocio.telefono.valor;
  const filas = filasComparativa(comparativa, modo);
  const conPrecio = serviciosConPrecio(serviciosOrdenados(servicios), modo);
  const mensajePaso = pasos.find((p) => p.accion === 'whatsapp')?.mensaje ?? MENSAJE_PORTADA;
  const enPortada = preguntasResueltas(faq, { negocio, retencion_dias: config.retencion_dias, modo })
    .flatMap((t) => t.preguntas)
    .filter((q) => q.en_portada);
  return (
    <VStack gap={8} className="portada">
      <VStack gap={4} as="section" aria-labelledby="portada-titulo">
        <CintaEtiqueta>Madrid · Platos de ducha, bañeras y azulejos</CintaEtiqueta>
        <Heading level={1} id="portada-titulo">
          {titularPortada(negocio.plazos.reparacion, modo)}
        </Heading>
        <Text type="large" as="p">
          {DESCRIPTION}
        </Text>
        <HStack gap={2} wrap="wrap" vAlign="center" id="cta-hero">
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
      <FranjaConfianza compromisos={compromisosFranja(negocio, modo)} />
      <BloqueAntesDespues galeria={galeria} whatsapp={whatsapp} />
      <Seccion id="portada-reparar-cambiar" titulo="¿Reparar o cambiar?">
        <TablaRepararCambiar filas={filas} fuente={comparativa.fuente} conCoste={filas.some((f) => f.id === 'coste')} />
      </Seccion>
      <Seccion id="portada-pasos" titulo="Cómo trabajamos">
        <PasosTrabajo pasos={resolverPasos(pasos, negocio, modo)} whatsapp={whatsapp} mensaje={mensajePaso} />
      </Seccion>
      <Seccion id="portada-servicios" titulo="Servicios">
        <VStack gap={3} as="ul" aria-label="Servicios">
          {serviciosOrdenados(servicios).map((s) => (
            <VStack as="li" key={s.slug}>
              <TarjetaServicio servicio={s} />
            </VStack>
          ))}
        </VStack>
      </Seccion>
      <Seccion id="portada-precios" titulo="Precios orientativos">
        {conPrecio.length ? (
          <VStack gap={3} as="ul" aria-label="Precios orientativos">
            {conPrecio.map((s) => (
              <HStack as="li" key={s.slug} gap={3} wrap="wrap" vAlign="center" justify="between">
                <Text weight="semibold">{s.nombre}</Text>
                <PrecioDesde dato={s.precio_desde} modo={modo} />
              </HStack>
            ))}
          </VStack>
        ) : (
          <VStack gap={3} hAlign="start">
            <Text as="p">Pide presupuesto gratuito</Text>
            {whatsapp ? (
              <BotonWhatsApp numero={whatsapp} mensaje={MENSAJE_PRECIO} etiqueta="Pide presupuesto por WhatsApp" variante="secondary" />
            ) : null}
          </VStack>
        )}
      </Seccion>
      <BloqueResenas resenas={resenas} />
      <FaqResumida preguntas={enPortada} />
      <Seccion id="portada-zonas" titulo="Zonas">
        <ListaZonas zonas={zonas} />
        <VStack gap={3} hAlign="start">
          <Text as="p">{NO_VES_TU_ZONA}</Text>
          {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={MENSAJE_ZONA} etiqueta="Pregunta por tu zona" variante="secondary" /> : null}
        </VStack>
      </Seccion>
      {/*
       * Formulario al final (brain/design.md § Portada, 11). Excepción aceptada por la spec: su «Enviar petición»
       * es el segundo primario de la portada; el flotante se oculta mientras se ve este o el del hero.
       */}
      <VStack gap={4} as="section" aria-labelledby="portada-formulario">
        <Heading level={2} id="portada-formulario">
          Mándanos una foto
        </Heading>
        <EnviarContacto
          config={{ retencion_dias: config.retencion_dias, foto_max_mb: config.foto_max_mb }}
          whatsapp={whatsapp}
          telefono={telefono}
          plazoRespuesta={respuesta(negocio.plazos.respuesta, modo)}
          mensajeWhatsApp={MENSAJE_PORTADA}
        />
      </VStack>
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
      servicios={cargarServicios()}
      pasos={cargarPasos()}
      comparativa={cargarComparativa()}
      zonas={cargarZonas()}
      galeria={cargarGaleria()}
      faq={cargarFaq()}
      resenas={cargarResenas()}
    />
  );
}
