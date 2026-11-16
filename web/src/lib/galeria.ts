/**
 * Filtro de la galería antes/después (/antes-y-despues/). Módulo PURO: sin React, Next ni fs; recibe los pares
 * de galeria.json y los servicios de servicios.json ya cargados.
 */
import type { ParGaleria } from './content.ts';

export interface ServicioFiltro {
  slug: string;
  nombre: string;
}

/** Valor del filtro que muestra todos los pares. */
export const TODOS = 'todos';

/**
 * Servicios con al menos un par, en el orden de servicios.json y con su nombre. Un slug de la galería que no está
 * en servicios.json va al final con el slug como nombre.
 */
export function serviciosConPares(pares: ParGaleria[], servicios: ServicioFiltro[]): ServicioFiltro[] {
  const usados = new Set(pares.map((p) => p.servicio));
  const conocidos = servicios.filter((s) => usados.has(s.slug)).map((s) => ({ slug: s.slug, nombre: s.nombre }));
  const slugs = new Set(servicios.map((s) => s.slug));
  const huerfanos = [...usados].filter((slug) => !slugs.has(slug)).map((slug) => ({ slug, nombre: slug }));
  return [...conocidos, ...huerfanos];
}

/** Pares de un servicio; `null` o «todos» devuelve una copia con todos. No muta la entrada. */
export function filtrarPares(pares: ParGaleria[], servicio: string | null): ParGaleria[] {
  if (servicio === null || servicio === TODOS) return [...pares];
  return pares.filter((p) => p.servicio === servicio);
}
