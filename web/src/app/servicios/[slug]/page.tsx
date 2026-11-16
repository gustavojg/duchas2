import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cargarGaleria, cargarNegocio, cargarServicios, type Servicio } from '../../../lib/content';
import { modoActual } from '../../../lib/dato';
import { type MetadataPagina, metadataPagina } from '../../../lib/seo';
import { APP_NAME } from '../../../lib/site';
import { PlantillaServicio } from '../../../ui/PlantillaServicio';

/** Solo existen las rutas de generateStaticParams (export estático): cualquier otro slug es 404. */
export const dynamicParams = false;

/** En Next 16 `params` es una Promise. */
interface Props {
  params: Promise<{ slug: string }>;
}

/** Un `{ slug }` por cada servicio de tipo 'servicio': un servicio nuevo en servicios.json trae su página. */
export function paramsServicios(servicios: readonly Servicio[]): { slug: string }[] {
  return servicios.filter((s) => s.tipo === 'servicio').map((s) => ({ slug: s.slug }));
}

/** Metadatos de un servicio: title y description de su `seo` y canonical = url_base + ruta. Lanza si no existe. */
export function metadataServicio(servicios: readonly Servicio[], slug: string, urlBase: string): MetadataPagina {
  const servicio = servicios.find((s) => s.slug === slug);
  if (!servicio) throw new Error(`servicios.json: no existe el servicio ${slug}`);
  return metadataPagina({ title: servicio.seo.title, description: servicio.seo.description, ruta: servicio.ruta, urlBase, nombreSitio: APP_NAME });
}

export function generateStaticParams(): { slug: string }[] {
  return paramsServicios(cargarServicios());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return metadataServicio(cargarServicios(), slug, cargarNegocio().url_base);
}

export default async function PaginaServicio({ params }: Props) {
  const { slug } = await params;
  const servicios = cargarServicios();
  const servicio = servicios.find((s) => s.slug === slug && s.tipo === 'servicio');
  if (!servicio) notFound();
  return <PlantillaServicio servicio={servicio} servicios={servicios} negocio={cargarNegocio()} modo={modoActual()} galeria={cargarGaleria()} />;
}
