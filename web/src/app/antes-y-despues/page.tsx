import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Metadata } from 'next';
import { cargarGaleria, cargarNegocio, cargarServicios, type Negocio, type ParGaleria, type Servicio } from '../../lib/content';
import { jsonLdBreadcrumbList, metadataPagina, type Miga } from '../../lib/seo';
import { esNumeroValido, mensajePorRuta } from '../../lib/whatsapp';
import { BotonWhatsApp } from '../../ui/BotonWhatsApp';
import { GaleriaFiltrable } from '../../ui/GaleriaFiltrable';
import { JsonLd } from '../../ui/JsonLd';
import { MigasDePan } from '../../ui/MigasDePan';

const RUTA = '/antes-y-despues/';
export const TITULO = 'Antes y después de platos de ducha y bañeras en Madrid';
export const DESCRIPCION = 'Mira cómo quedan los platos de ducha, bañeras y azulejos que reparamos. Filtra por trabajo y mándanos tu foto.';
const MIGAS: Miga[] = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Antes y después', ruta: RUTA },
];

export function generateMetadata(): Metadata {
  return metadataPagina({ title: TITULO, description: DESCRIPCION, ruta: RUTA, urlBase: cargarNegocio().url_base });
}

export interface PaginaAntesYDespuesProps {
  negocio: Negocio;
  servicios: Servicio[];
  galeria: ParGaleria[];
}

/**
 * Antes y después `/antes-y-despues/` (brain/design.md § Soporte): migas → H1 → galería filtrable por servicio
 * (GaleriaFiltrable, CTA cada 6 pares) → cierre con el WhatsApp primario en `#cta-hero`. JSON-LD BreadcrumbList.
 */
export function PaginaAntesYDespues({ negocio, servicios, galeria }: PaginaAntesYDespuesProps) {
  const whatsapp = negocio.whatsapp.valor && esNumeroValido(negocio.whatsapp.valor) ? negocio.whatsapp.valor : null;
  const mensaje = mensajePorRuta(RUTA, servicios);
  return (
    <VStack gap={8} className="portada">
      <MigasDePan migas={MIGAS} />
      <VStack gap={4} as="section" aria-labelledby="galeria-titulo">
        <Heading level={1} id="galeria-titulo">
          Antes y después de nuestros trabajos
        </Heading>
        <Text type="large" as="p">
          Elige un trabajo para ver solo sus fotos.
        </Text>
        <GaleriaFiltrable servicios={servicios} pares={galeria} whatsapp={whatsapp} mensaje={mensaje} />
      </VStack>

      <VStack gap={3} as="section" aria-labelledby="galeria-cierre" hAlign="start">
        <Heading level={2} id="galeria-cierre">
          ¿Quieres que el tuyo quede así?
        </Heading>
        <Text as="p" className="texto-largo">
          Mándanos una foto del daño y te decimos si tiene arreglo.
        </Text>
        <HStack gap={2} wrap="wrap" vAlign="center" id="cta-hero">
          {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta="Manda la foto por WhatsApp" /> : null}
        </HStack>
      </VStack>

      <JsonLd data={jsonLdBreadcrumbList(MIGAS, negocio.url_base)} />
    </VStack>
  );
}

export default function AntesYDespues() {
  return <PaginaAntesYDespues negocio={cargarNegocio()} servicios={cargarServicios()} galeria={cargarGaleria()} />;
}
