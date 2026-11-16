import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Link } from '@astryxdesign/core/Link';
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Metadata } from 'next';
import { APP_NAME } from '../../config';
import { serviciosOrdenados } from '../../lib/catalogo';
import { cargarNegocio, cargarServicios, type Negocio, type Servicio } from '../../lib/content';
import { type Modo, modoActual } from '../../lib/dato';
import { rutaGenerada } from '../../lib/paginas';
import { jsonLdBreadcrumbList, type MetadataPagina, metadataPagina, type Miga } from '../../lib/seo';
import { BotonWhatsApp } from '../../ui/BotonWhatsApp';
import { JsonLd } from '../../ui/JsonLd';
import { MigasDePan } from '../../ui/MigasDePan';
import { PrecioDesde } from '../../ui/PrecioDesde';

const RUTA = '/tarifas/';
const MIGAS: Miga[] = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Tarifas', ruta: RUTA },
];

/** Mensaje de WhatsApp de /tarifas/ (el mismo que el de «Precios orientativos» de la portada). */
export const MENSAJE_TARIFAS = 'Hola, quiero saber cuánto costaría arreglar mi baño. Os mando una foto.';

const TITLE = `Tarifas de reparación y esmaltado en Madrid · ${APP_NAME}`;
const DESCRIPTION =
  'Precio orientativo de cada trabajo: platos de ducha, bañeras y azulejos. Presupuesto gratuito con una foto por WhatsApp.';
const NOTA = 'Precio orientativo; el presupuesto final depende del daño';

/** Metadatos propios de /tarifas/ (distintos de los de /platos-de-ducha/) con canonical absoluto. */
export function metadataTarifas(urlBase: string): MetadataPagina {
  return metadataPagina({ title: TITLE, description: DESCRIPTION, ruta: RUTA, urlBase, nombreSitio: APP_NAME });
}

export function generateMetadata(): Metadata {
  return metadataTarifas(cargarNegocio().url_base);
}

export interface PaginaTarifasProps {
  negocio: Negocio;
  servicios: Servicio[];
  modo: Modo;
}

/**
 * Tarifas `/tarifas/` (brain/design.md § Soporte, PRD F4): migas, H1, WhatsApp primario en la cabecera de la
 * tabla (contenedor `cta-hero`, para que el flotante se oculte mientras se ve), Table de Astryx con 3 columnas
 * (Trabajo / Desde / Incluye) y una fila por servicio en su `orden`, la nota del precio orientativo y el cierre
 * con WhatsApp secundario y enlace al plato de ducha. El nombre de cada trabajo enlaza a su ficha solo si el build
 * genera esa página (rutaGenerada); si no, va como texto.«Desde» sale de PrecioDesde (nunca «0»); «Incluye» es el
 * `resumen` del servicio (servicios.json no tiene campo «incluye»). JSON-LD solo BreadcrumbList.
 */
export function PaginaTarifas({ negocio, servicios, modo }: PaginaTarifasProps) {
  const whatsapp = negocio.whatsapp.valor;
  return (
    <VStack gap={8} className="portada">
      <MigasDePan migas={MIGAS} />
      <VStack gap={3}>
        <Heading level={1}>Tarifas de reparación de platos de ducha y bañeras en Madrid</Heading>
        <Text type="large" as="p" className="texto-largo">
          Cada baño es distinto. Mándanos una foto y te damos el precio exacto, gratis.
        </Text>
      </VStack>

      <VStack gap={4} as="section" aria-labelledby="tarifas-tabla">
        <Heading level={2} id="tarifas-tabla">
          ¿Cuánto cuesta cada trabajo?
        </Heading>
        <HStack gap={2} wrap="wrap" vAlign="center" id="cta-hero">
          {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={MENSAJE_TARIFAS} etiqueta="Pide precio por WhatsApp" /> : null}
        </HStack>
        {/* Clases tabla-tarifas* (globals.css): ocupa el contenedor sin recortar ni partir palabras; en móvil
            cada fila se apila (nombre, precio, resumen). */}
        <Table dividers="rows" verticalAlign="top" className="tabla-tarifas">
          <TableHeader>
            <TableRow>
              <TableHeaderCell className="tabla-tarifas-trabajo">Trabajo</TableHeaderCell>
              <TableHeaderCell className="tabla-tarifas-desde">Desde</TableHeaderCell>
              <TableHeaderCell className="tabla-tarifas-incluye">Incluye</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviciosOrdenados(servicios).map((s) => (
              <TableRow key={s.slug}>
                <TableCell className="tabla-tarifas-trabajo">
                  {rutaGenerada(s.ruta) ? <Link href={s.ruta}>{s.nombre}</Link> : <Text>{s.nombre}</Text>}
                </TableCell>
                <TableCell className="tabla-tarifas-desde">
                  <PrecioDesde dato={s.precio_desde} modo={modo} />
                </TableCell>
                <TableCell className="tabla-tarifas-incluye">
                  <Text>{s.resumen}</Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Text as="p" type="supporting">
          {NOTA}
        </Text>
      </VStack>

      <VStack gap={3} as="section" aria-labelledby="tarifas-cierre" hAlign="start">
        <Heading level={2} id="tarifas-cierre">
          ¿Quieres saber cuánto costaría el tuyo?
        </Heading>
        <Text as="p" className="texto-largo">
          Con una foto del daño te decimos si tiene arreglo y cuánto cuesta.
        </Text>
        {whatsapp ? (
          <BotonWhatsApp numero={whatsapp} mensaje={MENSAJE_TARIFAS} etiqueta="Manda la foto por WhatsApp" variante="secondary" />
        ) : null}
        <Link href="/platos-de-ducha/">Ver cómo reparamos platos de ducha</Link>
      </VStack>

      <JsonLd data={jsonLdBreadcrumbList(MIGAS, negocio.url_base)} />
    </VStack>
  );
}

export default function Tarifas() {
  return <PaginaTarifas negocio={cargarNegocio()} servicios={cargarServicios()} modo={modoActual()} />;
}
