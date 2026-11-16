import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Metadata } from 'next';
import { Fragment, type ReactNode } from 'react';
import { filasComparativa, resolverPasos } from '../../lib/catalogo';
import { type ConfigFormulario, configFormulario } from '../../lib/config';
import {
  cargarComparativa,
  cargarGaleria,
  cargarNegocio,
  cargarPasos,
  cargarPlatoDucha,
  cargarServicios,
  type Comparativa,
  type Negocio,
  type ParGaleria,
  type Paso,
  type PlatoDucha,
  type Servicio,
} from '../../lib/content';
import { confirmado, type Modo, modoActual, texto } from '../../lib/dato';
import { respuestaFaq } from '../../lib/faq';
import { jsonLdBreadcrumbList, jsonLdFaqPage, jsonLdService, type MetadataPagina, metadataPagina, type Miga } from '../../lib/seo';
import { mensajePorRuta, telLink } from '../../lib/whatsapp';
import { AcordeonFaq } from '../../ui/AcordeonFaq';
import { IlustracionDano, PlatoPartido } from '../../ui/art';
import { BotonLlamar } from '../../ui/BotonLlamar';
import { BotonWhatsApp } from '../../ui/BotonWhatsApp';
import { CintaEtiqueta } from '../../ui/CintaEtiqueta';
import { DeslizadorAntesDespues } from '../../ui/DeslizadorAntesDespues';
import { JsonLd } from '../../ui/JsonLd';
import { MigasDePan } from '../../ui/MigasDePan';
import { PasosTrabajo } from '../../ui/PasosTrabajo';
import { PrecioDesde } from '../../ui/PrecioDesde';
import { TablaRepararCambiar } from '../../ui/TablaRepararCambiar';
import { TarjetaServicio } from '../../ui/TarjetaServicio';

const RUTA = '/platos-de-ducha/';
const SLUG = 'platos-de-ducha';
const MIGAS: Miga[] = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Platos de ducha', ruta: RUTA },
];
const SIN_MATERIALES = 'Mándanos una foto de tu plato y te decimos si se puede reparar.';
const GALERIA_VACIA = 'Aún no hemos subido fotos de este trabajo. Mándanos la tuya y te decimos qué podemos hacer.';
const CTA = 'Manda la foto por WhatsApp';
const CTA_SECUNDARIO = 'Manda la foto del tuyo';

/** Metadatos de la página: title y description del servicio `platos-de-ducha` de servicios.json. */
export function metadataPlatosDeDucha(servicios: readonly Servicio[], urlBase: string): MetadataPagina {
  const plato = servicios.find((s) => s.slug === SLUG);
  if (!plato) throw new Error(`servicios.json: falta el servicio ${SLUG}`);
  return metadataPagina({ title: plato.seo.title, description: plato.seo.description, ruta: RUTA, urlBase });
}

export function generateMetadata(): Metadata {
  return metadataPlatosDeDucha(cargarServicios(), cargarNegocio().url_base);
}

export interface PaginaPlatosDeDuchaProps {
  negocio: Negocio;
  config: ConfigFormulario;
  modo: Modo;
  servicios: Servicio[];
  contenido: PlatoDucha;
  comparativa: Comparativa;
  galeria: ParGaleria[];
  pasos: Paso[];
}

/** Sección con su H2 (el id enlaza el aria-labelledby). */
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

/** Párrafo de texto largo, limitado a --measure (clase `texto-largo` de globals.css). */
function TextoLargo({ children }: { children: string }) {
  return (
    <Text as="p" className="texto-largo">
      {children}
    </Text>
  );
}

/**
 * Página larga del plato de ducha `/platos-de-ducha/` (brain/design.md § Platos de ducha, PRD F2): migas →
 * hero con el único primario (WhatsApp con el mensaje de la ruta) → rejilla de 6 daños → un H2 por daño con un
 * CTA secundario cada 2 → antideslizante y cambio de color → materiales (solo los confirmados como
 * reparables) → galería del plato → ¿Reparar o cambiar? → proceso (curado con plazos.uso_ducha) → precio →
 * FAQ → cierre y relacionados. JSON-LD Service, FAQPage (las mismas FAQ visibles) y BreadcrumbList (las mismas
 * migas). Textos de plato-ducha.json; plazos y cifras de faq.ts, textos.ts y dato.ts.
 */
export function PaginaPlatosDeDucha({ negocio, config, modo, servicios, contenido, comparativa, galeria, pasos }: PaginaPlatosDeDuchaProps) {
  const whatsapp = negocio.whatsapp.valor;
  const telefono = negocio.telefono.valor;
  const mensaje = mensajePorRuta(RUTA);
  const ctx = { negocio, retencion_dias: config.retencion_dias, modo };
  const plato = servicios.find((s) => s.slug === SLUG);
  const filas = filasComparativa(comparativa, modo);
  const faqs = contenido.faqs.map((q) => ({ p: q.p, r: respuestaFaq(q.r, ctx) }));
  const pares = galeria.filter((p) => p.servicio === SLUG);
  const relacionados = (plato?.relacionados ?? [])
    .map((slug) => servicios.find((s) => s.slug === slug))
    .filter((s): s is Servicio => s !== undefined);
  // Reparables: confirmados con valor true; en local, también los pendientes con {{PENDIENTE}}.
  const materiales = contenido.materiales.flatMap((m) => {
    if (confirmado(m.reparable)) return m.reparable.valor ? [m.nombre] : [];
    return modo === 'pendientes' ? [`${m.nombre}: ${texto(m.reparable, modo)}`] : [];
  });
  const ctaSecundario = whatsapp ? (
    <VStack hAlign="start">
      <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta={CTA_SECUNDARIO} variante="secondary" />
    </VStack>
  ) : null;

  return (
    <VStack gap={8} className="portada">
      <MigasDePan migas={MIGAS} />
      <VStack gap={4} as="section" aria-labelledby="plato-titulo">
        <CintaEtiqueta>Madrid · Platos de ducha</CintaEtiqueta>
        <Heading level={1} id="plato-titulo">
          {contenido.h1}
        </Heading>
        {plato ? (
          <Text type="large" as="p">
            {plato.problema}
          </Text>
        ) : null}
        <HStack gap={2} wrap="wrap" vAlign="center" id="cta-hero">
          {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta={CTA} /> : null}
          {telefono ? <BotonLlamar href={telLink(telefono)} etiqueta="Llamar" /> : null}
        </HStack>
        <Text type="supporting" as="p">
          {`Tu foto solo la vemos nosotros y se borra a los ${config.retencion_dias} días`}
        </Text>
        <Card padding={0}>
          <PlatoPartido />
        </Card>
      </VStack>

      <Seccion id="plato-danos" titulo="¿Qué le pasa a tu plato?">
        <VStack gap={3} as="ul" aria-label="Daños que reparamos">
          {contenido.danos.map((d) => (
            <VStack as="li" key={d.id}>
              <Card>
                <HStack gap={3} vAlign="center">
                  <VStack className="plato-dano-icono">
                    <IlustracionDano dano={d.id} decorative />
                  </VStack>
                  <Link href={`#${d.id}`}>{d.titulo}</Link>
                </HStack>
              </Card>
            </VStack>
          ))}
        </VStack>
      </Seccion>

      {contenido.danos.map((d, i) => (
        <Fragment key={d.id}>
          <Seccion id={d.id} titulo={d.titulo}>
            <TextoLargo>{d.texto}</TextoLargo>
          </Seccion>
          {i % 2 === 1 ? ctaSecundario : null}
        </Fragment>
      ))}

      <Seccion id="plato-antideslizante" titulo={contenido.antideslizante.titulo}>
        <TextoLargo>{contenido.antideslizante.texto}</TextoLargo>
      </Seccion>
      <Seccion id="plato-color" titulo={contenido.cambio_color.titulo}>
        <TextoLargo>{contenido.cambio_color.texto}</TextoLargo>
      </Seccion>

      <Seccion id="plato-materiales" titulo="¿Qué platos de ducha se pueden reparar?">
        {materiales.length ? (
          <VStack gap={2} as="ul" aria-label="Materiales que reparamos">
            {materiales.map((m) => (
              <VStack as="li" key={m}>
                <Text>{m}</Text>
              </VStack>
            ))}
          </VStack>
        ) : (
          <TextoLargo>{SIN_MATERIALES}</TextoLargo>
        )}
      </Seccion>

      <Seccion id="plato-galeria" titulo="¿Cómo queda un plato de ducha reparado?">
        {pares.length ? (
          <VStack gap={6} as="ul" aria-label="Antes y después de platos de ducha">
            {pares.map((par) => (
              <VStack as="li" key={par.alt_despues}>
                <DeslizadorAntesDespues par={par} />
              </VStack>
            ))}
          </VStack>
        ) : (
          <VStack gap={3} hAlign="start">
            <TextoLargo>{GALERIA_VACIA}</TextoLargo>
            {ctaSecundario}
          </VStack>
        )}
      </Seccion>

      <Seccion id="plato-reparar-cambiar" titulo="¿Reparar o cambiar?">
        <TablaRepararCambiar filas={filas} fuente={comparativa.fuente} conCoste={filas.some((f) => f.id === 'coste')} />
      </Seccion>

      <Seccion id="plato-proceso" titulo={contenido.proceso.titulo}>
        <TextoLargo>{contenido.proceso.intro}</TextoLargo>
        <PasosTrabajo pasos={resolverPasos(pasos, negocio, modo)} whatsapp={whatsapp} mensaje={mensaje} />
        <TextoLargo>{respuestaFaq(contenido.proceso.curado, ctx)}</TextoLargo>
      </Seccion>

      {plato ? (
        <Seccion id="plato-precio" titulo="¿Cuánto cuesta reparar un plato de ducha?">
          <PrecioDesde dato={plato.precio_desde} modo={modo} />
          <Link href="/tarifas/">Ver todas las tarifas</Link>
        </Seccion>
      ) : null}

      <Seccion id="plato-faq" titulo="Preguntas frecuentes sobre platos de ducha">
        <AcordeonFaq preguntas={faqs} idBase="plato-faq" />
      </Seccion>

      <VStack gap={3} as="section" aria-labelledby="plato-cierre" hAlign="start">
        <Heading level={2} id="plato-cierre">
          ¿Tiene arreglo tu plato?
        </Heading>
        <TextoLargo>Mándanos una foto del daño y te lo decimos.</TextoLargo>
        {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta={CTA} variante="secondary" /> : null}
      </VStack>

      {relacionados.length ? (
        <Seccion id="plato-relacionados" titulo="También te puede interesar">
          <VStack gap={3} as="ul" aria-label="Servicios relacionados">
            {relacionados.map((s) => (
              <VStack as="li" key={s.slug}>
                <TarjetaServicio servicio={s} grande={false} />
              </VStack>
            ))}
          </VStack>
        </Seccion>
      ) : null}

      <JsonLd
        data={jsonLdService({
          nombre: plato?.nombre ?? 'Reparación de platos de ducha',
          descripcion: plato?.seo.description ?? contenido.h1,
          urlBase: negocio.url_base,
          ruta: RUTA,
          negocio,
        })}
      />
      <JsonLd data={jsonLdFaqPage(faqs)} />
      <JsonLd data={jsonLdBreadcrumbList(MIGAS, negocio.url_base)} />
    </VStack>
  );
}

export default function PlatosDeDucha() {
  return (
    <PaginaPlatosDeDucha
      negocio={cargarNegocio()}
      config={configFormulario()}
      modo={modoActual()}
      servicios={cargarServicios()}
      contenido={cargarPlatoDucha()}
      comparativa={cargarComparativa()}
      galeria={cargarGaleria()}
      pasos={cargarPasos()}
    />
  );
}
