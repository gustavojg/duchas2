import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { ReactNode } from 'react';
import type { Negocio, ParGaleria, Servicio } from '../lib/content';
import type { Modo } from '../lib/dato';
import { parHueco } from '../lib/galeria';
import { jsonLdBreadcrumbList, jsonLdService, type Miga } from '../lib/seo';
import { esNumeroValido, telLink } from '../lib/whatsapp';
import { AcordeonFaq } from './AcordeonFaq';
import { BotonLlamar } from './BotonLlamar';
import { BotonWhatsApp } from './BotonWhatsApp';
import { CintaEtiqueta } from './CintaEtiqueta';
import { DeslizadorAntesDespues } from './DeslizadorAntesDespues';
import { JsonLd } from './JsonLd';
import { MigasDePan } from './MigasDePan';
import { PrecioDesde } from './PrecioDesde';
import { TarjetaServicio } from './TarjetaServicio';

const CTA = 'Manda la foto por WhatsApp';
const CTA_SECUNDARIO = 'Manda la foto del tuyo';
/** Como mucho, tantas tarjetas de «También te puede interesar». */
const MAX_RELACIONADOS = 3;

export interface PlantillaServicioProps {
  /** Servicio de tipo 'servicio' de servicios.json. */
  servicio: Servicio;
  /** Catálogo completo: resuelve `servicio.relacionados`. */
  servicios: readonly Servicio[];
  negocio: Negocio;
  modo: Modo;
  /** galeria.json entera: la plantilla se queda con los pares del servicio. */
  galeria: readonly ParGaleria[];
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

/** Pasos de `como` en lista ordenada, con «PASO N» en la cinta (como PasosTrabajo). También en /hoteles-y-comunidades/. */
export function PasosServicio({ pasos, etiqueta }: { pasos: readonly string[]; etiqueta: string }) {
  return (
    <VStack as="ol" gap={4} aria-label={etiqueta}>
      {pasos.map((paso, i) => (
        <VStack as="li" key={paso} gap={2}>
          <Text as="p" type="code" weight="bold" color="inherit" className="paso-numero">
            {`PASO ${i + 1}`}
          </Text>
          <Text as="p">{paso}</Text>
        </VStack>
      ))}
    </VStack>
  );
}

/**
 * Página de un servicio `/servicios/<slug>/` (brain/design.md § Servicio (plantilla)): migas → hero (cinta,
 * H1 «<servicio> en Madrid», resumen y CTA en `#cta-hero`) → problema → cómo (pasos con «PASO N» en cinta) →
 * precio → antes/después (pares del servicio o el hueco de parHueco) → FAQ → cierre → relacionados. JSON-LD
 * Service y BreadcrumbList con las mismas migas. Todo sale de servicios.json, negocio.json y galeria.json.
 */
export function PlantillaServicio({ servicio, servicios, negocio, modo, galeria }: PlantillaServicioProps) {
  const { slug, nombre, ruta } = servicio;
  const migas: Miga[] = [
    { nombre: 'Inicio', ruta: '/' },
    { nombre, ruta },
  ];
  const whatsapp = negocio.whatsapp.valor && esNumeroValido(negocio.whatsapp.valor) ? negocio.whatsapp.valor : null;
  const telefono = negocio.telefono.valor && esNumeroValido(negocio.telefono.valor) ? negocio.telefono.valor : null;
  const mensaje = servicio.whatsapp_mensaje;
  const propios = galeria.filter((p) => p.servicio === slug);
  const pares = propios.length ? propios : [parHueco(servicio)];
  const relacionados = servicio.relacionados
    .map((r) => servicios.find((s) => s.slug === r))
    .filter((s): s is Servicio => s !== undefined)
    .slice(0, MAX_RELACIONADOS);
  const ctaSecundario = whatsapp ? (
    <VStack hAlign="start">
      <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta={CTA_SECUNDARIO} variante="secondary" />
    </VStack>
  ) : null;

  return (
    <VStack gap={8} className="portada">
      <MigasDePan migas={migas} />
      <VStack gap={4} as="section" aria-labelledby="servicio-titulo">
        <CintaEtiqueta>{`Madrid · ${nombre}`}</CintaEtiqueta>
        <Heading level={1} id="servicio-titulo">
          {`${nombre} en Madrid`}
        </Heading>
        <Text type="large" as="p">
          {servicio.resumen}
        </Text>
        <HStack gap={2} wrap="wrap" vAlign="center" id="cta-hero">
          {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta={CTA} /> : null}
          {telefono ? <BotonLlamar href={telLink(telefono)} etiqueta="Llamar" /> : null}
        </HStack>
      </VStack>

      <Seccion id="servicio-problema" titulo="¿Qué problema resuelve?">
        <Text as="p" className="texto-largo">
          {servicio.problema}
        </Text>
      </Seccion>

      <Seccion id="servicio-como" titulo="Cómo lo hacemos">
        <PasosServicio pasos={servicio.como} etiqueta={`Pasos de ${nombre}`} />
      </Seccion>

      <Seccion id="servicio-precio" titulo="¿Cuánto cuesta?">
        <PrecioDesde dato={servicio.precio_desde} modo={modo} />
        {ctaSecundario}
      </Seccion>

      <Seccion id="servicio-galeria" titulo="Antes y después">
        <VStack gap={6} as="ul" aria-label={`Antes y después de ${nombre}`}>
          {pares.map((par) => (
            <VStack as="li" key={par.alt_despues}>
              <DeslizadorAntesDespues par={par} />
            </VStack>
          ))}
        </VStack>
      </Seccion>

      <Seccion id="servicio-faq" titulo="Preguntas frecuentes">
        <AcordeonFaq preguntas={servicio.faqs} idBase={slug} />
      </Seccion>

      <VStack gap={3} as="section" aria-labelledby="servicio-cierre" hAlign="start">
        <Heading level={2} id="servicio-cierre">
          ¿Tiene arreglo lo tuyo?
        </Heading>
        <Text as="p" className="texto-largo">
          Mándanos una foto del daño y te lo decimos.
        </Text>
        {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta={CTA} variante="secondary" /> : null}
      </VStack>

      {relacionados.length ? (
        <Seccion id="servicio-relacionados" titulo="También te puede interesar">
          <VStack gap={3} as="ul" aria-label="Servicios relacionados">
            {relacionados.map((s) => (
              <VStack as="li" key={s.slug}>
                <TarjetaServicio servicio={s} grande={false} />
              </VStack>
            ))}
          </VStack>
        </Seccion>
      ) : null}

      <JsonLd data={jsonLdService({ nombre, descripcion: servicio.seo.description, urlBase: negocio.url_base, ruta, negocio })} />
      <JsonLd data={jsonLdBreadcrumbList(migas, negocio.url_base)} />
    </VStack>
  );
}
