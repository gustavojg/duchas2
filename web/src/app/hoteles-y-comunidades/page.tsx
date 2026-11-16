import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  cargarGaleria,
  cargarNegocio,
  cargarReferencias,
  cargarServicios,
  type Negocio,
  type ParGaleria,
  type Referencia,
  type Servicio,
} from '../../lib/content';
import { type Modo, modoActual } from '../../lib/dato';
import { parHueco } from '../../lib/galeria';
import { jsonLdBreadcrumbList, jsonLdService, type MetadataPagina, metadataPagina, type Miga } from '../../lib/seo';
import { garantia } from '../../lib/textos';
import { esNumeroValido, mensajePorRuta, telLink } from '../../lib/whatsapp';
import { AcordeonFaq } from '../../ui/AcordeonFaq';
import { BotonLlamar } from '../../ui/BotonLlamar';
import { BotonWhatsApp } from '../../ui/BotonWhatsApp';
import { CintaEtiqueta } from '../../ui/CintaEtiqueta';
import { DeslizadorAntesDespues } from '../../ui/DeslizadorAntesDespues';
import { JsonLd } from '../../ui/JsonLd';
import { MigasDePan } from '../../ui/MigasDePan';
import { PasosServicio } from '../../ui/PlantillaServicio';

const RUTA = '/hoteles-y-comunidades/';
const SLUG = 'hoteles-y-comunidades';
const H1 = 'Renovamos bañeras de hotel sin cerrar habitaciones';
const CTA = 'Escríbenos por WhatsApp';
const MIGAS: Miga[] = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Hoteles y comunidades', ruta: RUTA },
];

/** El servicio de empresas de servicios.json; lanza si falta (rompe el build). */
function servicioEmpresas(servicios: readonly Servicio[]): Servicio {
  const s = servicios.find((x) => x.slug === SLUG);
  if (!s) throw new Error(`servicios.json: falta el servicio ${SLUG}`);
  return s;
}

/** Metadatos: title y description del servicio `hoteles-y-comunidades` de servicios.json. */
export function metadataHoteles(servicios: readonly Servicio[], urlBase: string): MetadataPagina {
  const s = servicioEmpresas(servicios);
  return metadataPagina({ title: s.seo.title, description: s.seo.description, ruta: RUTA, urlBase });
}

export function generateMetadata(): Metadata {
  return metadataHoteles(cargarServicios(), cargarNegocio().url_base);
}

export interface PaginaHotelesProps {
  negocio: Negocio;
  servicios: Servicio[];
  /** referencias.json: vacío ⇒ no hay sección de referencias (nunca se inventan). */
  referencias: Referencia[];
  galeria: ParGaleria[];
  modo: Modo;
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

/**
 * Hoteles y comunidades `/hoteles-y-comunidades/` (brain/design.md § Hoteles): migas → H1 y CTA en `#cta-hero`
 * → cómo trabajamos con hoteles (pasos del servicio) → referencias (solo si las hay) → garantía (textos.garantia)
 * → antes y después (pares del servicio o parHueco) → «Cuéntanos cuántas bañeras y cuándo» con WhatsApp y FAQ.
 * El mensaje de WhatsApp es el del servicio de empresas (mensajePorRuta). JSON-LD Service y BreadcrumbList.
 */
export function PaginaHoteles({ negocio, servicios, referencias, galeria, modo }: PaginaHotelesProps) {
  const servicio = servicioEmpresas(servicios);
  const whatsapp = negocio.whatsapp.valor && esNumeroValido(negocio.whatsapp.valor) ? negocio.whatsapp.valor : null;
  const telefono = negocio.telefono.valor && esNumeroValido(negocio.telefono.valor) ? negocio.telefono.valor : null;
  const mensaje = mensajePorRuta(RUTA, servicios);
  const propios = galeria.filter((p) => p.servicio === SLUG);
  const pares = propios.length ? propios : [parHueco(servicio)];

  return (
    <VStack gap={8} className="portada">
      <MigasDePan migas={MIGAS} />
      <VStack gap={4} as="section" aria-labelledby="hoteles-titulo">
        <CintaEtiqueta>Madrid · Hoteles y comunidades</CintaEtiqueta>
        <Heading level={1} id="hoteles-titulo">
          {H1}
        </Heading>
        <Text type="large" as="p">
          {servicio.resumen}
        </Text>
        <HStack gap={2} wrap="wrap" vAlign="center" id="cta-hero">
          {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta={CTA} /> : null}
          {telefono ? <BotonLlamar href={telLink(telefono)} etiqueta="Llamar" /> : null}
        </HStack>
      </VStack>

      <Seccion id="hoteles-como" titulo="Cómo trabajamos con hoteles">
        <Text as="p" className="texto-largo">
          {servicio.problema}
        </Text>
        <PasosServicio pasos={servicio.como} etiqueta="Pasos para trabajar con tu hotel o comunidad" />
      </Seccion>

      {referencias.length > 0 ? (
        <Seccion id="hoteles-referencias" titulo="Referencias">
          <VStack gap={3} as="ul" aria-label="Hoteles y comunidades con los que hemos trabajado">
            {referencias.map((r) => (
              <VStack as="li" key={r.nombre}>
                <Card>
                  <VStack gap={1}>
                    <Heading level={3}>{r.nombre}</Heading>
                    <Text as="p" type="supporting">
                      {r.tipo}
                    </Text>
                    <Text as="p">{r.texto}</Text>
                  </VStack>
                </Card>
              </VStack>
            ))}
          </VStack>
        </Seccion>
      ) : null}

      <Seccion id="hoteles-garantia" titulo="¿Qué garantía dais?">
        <Text as="p">{garantia(negocio.garantia.anios, modo)}</Text>
      </Seccion>

      <Seccion id="hoteles-galeria" titulo="Antes y después">
        <VStack gap={6} as="ul" aria-label="Antes y después en hoteles y comunidades">
          {pares.map((par) => (
            <VStack as="li" key={par.alt_despues}>
              <DeslizadorAntesDespues par={par} />
            </VStack>
          ))}
        </VStack>
      </Seccion>

      <Seccion id="hoteles-cierre" titulo="Cuéntanos cuántas bañeras y cuándo">
        <Text as="p" className="texto-largo">
          Te preparamos un plan por habitaciones o viviendas.
        </Text>
        {whatsapp ? (
          <VStack hAlign="start">
            <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta={CTA} variante="secondary" />
          </VStack>
        ) : null}
        <AcordeonFaq preguntas={servicio.faqs} idBase={SLUG} />
      </Seccion>

      <JsonLd
        data={jsonLdService({ nombre: servicio.nombre, descripcion: servicio.seo.description, urlBase: negocio.url_base, ruta: RUTA, negocio })}
      />
      <JsonLd data={jsonLdBreadcrumbList(MIGAS, negocio.url_base)} />
    </VStack>
  );
}

export default function Hoteles() {
  return (
    <PaginaHoteles
      negocio={cargarNegocio()}
      servicios={cargarServicios()}
      referencias={cargarReferencias()}
      galeria={cargarGaleria()}
      modo={modoActual()}
    />
  );
}
