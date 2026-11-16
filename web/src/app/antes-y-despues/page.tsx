import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Metadata } from 'next';
import { cargarGaleria, cargarNegocio, cargarServicios, type Negocio, type ParGaleria, type Servicio } from '../../lib/content';
import { jsonLdBreadcrumbList, metadataPagina, type Miga } from '../../lib/seo';
import { APP_NAME } from '../../lib/site';
import { esNumeroValido, mensajePorRuta } from '../../lib/whatsapp';
import { BotonWhatsApp } from '../../ui/BotonWhatsApp';
import { GaleriaFiltrable } from '../../ui/GaleriaFiltrable';
import { JsonLd } from '../../ui/JsonLd';
import { MigasDePan } from '../../ui/MigasDePan';

const RUTA = '/antes-y-despues/';
/** Título de main (exacto); no repite el de ninguna otra página. */
export const TITULO = `Antes y después · ${APP_NAME}`;
export const DESCRIPCION =
  'Mira cómo quedan los platos de ducha y las bañeras antes y después de repararlos en casa, sin obras. Filtra por servicio.';
const MIGAS: Miga[] = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Antes y después', ruta: RUTA },
];
const CTA = 'Manda la foto del tuyo';
/** Intro mientras ningún par tiene antes y después: no presenta las ilustraciones como trabajos reales. */
export const INTRO_ILUSTRACIONES =
  'Estas ilustraciones enseñan qué se repara en cada servicio; no son trabajos reales. Elige un servicio para verlas.';
/** Intro en cuanto algún par tiene las dos fotos. */
export const INTRO_FOTOS = 'Elige un servicio para ver solo esos trabajos.';

/** Metadata propia con canonical de url_base, como el resto de páginas de PAGES. */
export function generateMetadata(): Metadata {
  return metadataPagina({ title: TITULO, description: DESCRIPCION, ruta: RUTA, urlBase: cargarNegocio().url_base, nombreSitio: APP_NAME });
}

export interface PaginaAntesYDespuesProps {
  negocio: Negocio;
  servicios: Servicio[];
  galeria: ParGaleria[];
}

/**
 * Antes y después `/antes-y-despues/` (brain/design.md § Soporte): H1 → migas → galería filtrable por servicio
 * (GaleriaFiltrable, CTA cada 6 pares) → cierre con el WhatsApp primario en `#cta-hero`. JSON-LD BreadcrumbList.
 * Contenedor `portada portada-galeria` (más ancho que el de texto, para la rejilla de pares). El H1 abre el
 * contenedor, como en /zonas/ y /contacto/, para que su margen superior sea el mismo (tests/e2e/margen-h1.spec.ts).
 */
export function PaginaAntesYDespues({ negocio, servicios, galeria }: PaginaAntesYDespuesProps) {
  const whatsapp = negocio.whatsapp.valor && esNumeroValido(negocio.whatsapp.valor) ? negocio.whatsapp.valor : null;
  const mensaje = mensajePorRuta(RUTA, servicios);
  const hayFotos = galeria.some((p) => p.antes && p.despues);
  return (
    <VStack gap={8} className="portada portada-galeria">
      <VStack gap={4} as="section" aria-labelledby="galeria-titulo">
        <Heading level={1} id="galeria-titulo">
          Antes y después de nuestros trabajos
        </Heading>
        <MigasDePan migas={MIGAS} />
        <Text type="large" as="p">
          {hayFotos ? INTRO_FOTOS : INTRO_ILUSTRACIONES}
        </Text>
        <GaleriaFiltrable servicios={servicios} pares={galeria} whatsapp={whatsapp} mensaje={mensaje} />
      </VStack>

      <VStack gap={3} as="section" aria-labelledby="galeria-cierre" hAlign="start">
        <Heading level={2} id="galeria-cierre">
          ¿Quieres que el tuyo quede así?
        </Heading>
        <Text as="p" className="texto-largo">
          ¿El tuyo tiene arreglo? Mándanos una foto por WhatsApp y te lo decimos.
        </Text>
        <HStack gap={2} wrap="wrap" vAlign="center" id="cta-hero">
          {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta={CTA} /> : null}
        </HStack>
      </VStack>

      <JsonLd data={jsonLdBreadcrumbList(MIGAS, negocio.url_base)} />
    </VStack>
  );
}

export interface AntesYDespuesProps {
  pares: ParGaleria[];
  servicios: Servicio[];
  negocio: Negocio;
}

/** Firma de main (pares/servicios/negocio): la misma página. */
export function AntesYDespues({ pares, servicios, negocio }: AntesYDespuesProps) {
  return <PaginaAntesYDespues negocio={negocio} servicios={servicios} galeria={pares} />;
}

export default function AntesYDespuesPage() {
  return <PaginaAntesYDespues negocio={cargarNegocio()} servicios={cargarServicios()} galeria={cargarGaleria()} />;
}
