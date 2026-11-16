/**
 * Galería antes/después (/antes-y-despues/, páginas de servicio y Hoteles): opciones del filtro, filtrado,
 * servicios con pares, bloques con CTA y el hueco de un servicio sin fotos.
 * Puro: sin React, Next, node:*, fs ni window (lo usan GaleriaFiltrable y FiltroGaleria en el cliente).
 */
import { serviciosOrdenados } from './catalogo.ts';
import type { ParGaleria, Servicio } from './content.ts';

/** Vacío de galería (brain/design.md § Textos). */
export const GALERIA_VACIA = 'Aún no hemos subido fotos de este trabajo. Mándanos la tuya y te decimos qué podemos hacer.';

/** Valor del filtro que muestra todos los pares. */
export const TODOS = 'todos';

export interface ServicioFiltro {
  slug: string;
  nombre: string;
}

export interface OpcionFiltro {
  valor: string;
  etiqueta: string;
}

/** «Todos» y un servicio por opción, por `orden`, sin el de empresas (sus fotos son de los demás trabajos). */
export function opcionesFiltro(servicios: readonly Servicio[]): OpcionFiltro[] {
  return [
    { valor: TODOS, etiqueta: 'Todos' },
    ...serviciosOrdenados(servicios)
      .filter((s) => s.tipo !== 'empresas')
      .map((s) => ({ valor: s.slug, etiqueta: s.nombre })),
  ];
}

/**
 * Servicios con al menos un par, en el orden de servicios.json y con su nombre. Un slug de la galería que no está
 * en servicios.json va al final con el slug como nombre.
 */
export function serviciosConPares(pares: readonly ParGaleria[], servicios: readonly ServicioFiltro[]): ServicioFiltro[] {
  const usados = new Set(pares.map((p) => p.servicio));
  const conocidos = servicios.filter((s) => usados.has(s.slug)).map((s) => ({ slug: s.slug, nombre: s.nombre }));
  const slugs = new Set(servicios.map((s) => s.slug));
  const huerfanos = [...usados].filter((slug) => !slugs.has(slug)).map((slug) => ({ slug, nombre: slug }));
  return [...conocidos, ...huerfanos];
}

/** Pares del filtro: con `null` o «todos», una copia con todos; con un slug, solo los de ese servicio. No muta la entrada. */
export function filtrarPares(pares: readonly ParGaleria[], valor: string | null): ParGaleria[] {
  if (valor === null || valor === TODOS) return [...pares];
  return pares.filter((p) => p.servicio === valor);
}

/** Bloques de `tamano` pares: tras cada bloque que no sea el último va un CTA. */
export function grupos<T>(pares: readonly T[], tamano = 6): T[][] {
  const bloques: T[][] = [];
  for (let i = 0; i < pares.length; i += tamano) bloques.push(pares.slice(i, i + tamano));
  return bloques;
}

/** Par sin fotos de un servicio: el hueco dice qué foto va ahí. */
export function parHueco(servicio: Pick<Servicio, 'slug' | 'nombre'>): ParGaleria {
  return {
    servicio: servicio.slug,
    antes: null,
    despues: null,
    alt_antes: `Antes del trabajo de ${servicio.nombre}`,
    alt_despues: `Después del trabajo de ${servicio.nombre}`,
    hueco: `Foto de ${servicio.nombre} antes y después`,
  };
}
