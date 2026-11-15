import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { ReactNode } from 'react';
import { filasComparativa, resolverPasos, serviciosConPrecio, serviciosOrdenados } from '../lib/catalogo';
import { type ConfigFormulario, configFormulario } from '../lib/config';
import {
  cargarComparativa,
  cargarNegocio,
  cargarPasos,
  cargarServicios,
  cargarZonas,
  type Comparativa,
  type Negocio,
  type Paso,
  type Servicio,
  type Zonas,
} from '../lib/content';
import { type Modo, modoActual } from '../lib/dato';
import { DESCRIPTION } from '../lib/site';
import { compromisosFranja, respuesta, titularPortada } from '../lib/textos';
import { MENSAJE_PORTADA, telLink } from '../lib/whatsapp';
import { PlatoPartido } from '../ui/art';
import { BotonLlamar } from '../ui/BotonLlamar';
import { BotonWhatsApp } from '../ui/BotonWhatsApp';
import { CintaEtiqueta } from '../ui/CintaEtiqueta';
import { EnviarContacto } from '../ui/EnviarContacto';
import { FranjaConfianza } from '../ui/FranjaConfianza';
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
 * confianza (compromisos de textos.compromisosFranja()) y los módulos ¿Reparar o cambiar?, Cómo trabajamos,
 * Servicios, Precios orientativos y Zonas; al final, el formulario de contacto.
 * Los botones van antes de la ilustración para que en 360 × 740 se vean sin scroll. Todos los plazos y
 * cifras salen de textos.ts y catalogo.ts con el contenido que recibe por props (los tests inyectan el suyo).
 * El único botón primario es el WhatsApp del hero; el resto son secundarios, salvo «Enviar petición» del
 * formulario (excepción aceptada por la spec).
 */
export function Portada({ negocio, config, modo, servicios, pasos, comparativa, zonas }: PortadaProps) {
  const whatsapp = negocio.whatsapp.valor;
  const telefono = negocio.telefono.valor;
  const filas = filasComparativa(comparativa, modo);
  const conPrecio = serviciosConPrecio(serviciosOrdenados(servicios), modo);
  const mensajePaso = pasos.find((p) => p.accion === 'whatsapp')?.mensaje ?? MENSAJE_PORTADA;
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
    />
  );
}
