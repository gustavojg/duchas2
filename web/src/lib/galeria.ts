/**
 * Galería antes/después: opciones del filtro, filtrado, bloques con CTA y el hueco de un servicio sin fotos.
 * Puro: sin React, Next, node:* ni window (lo usa GaleriaFiltrable en el cliente).
 */
import { serviciosOrdenados } from './catalogo.ts';
import type { ParGaleria, Servicio } from './content.ts';

/** Vacío de galería (brain/design.md § Textos). */
export const GALERIA_VACIA = 'Aún no hemos subido fotos de este trabajo. Mándanos la tuya y te decimos qué podemos hacer.';

/** Valor del filtro que muestra todos los pares. */
export const TODOS = 'todos';

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

/** Pares del filtro: con «todos», todos; con un slug, solo los de ese servicio. */
export function filtrarPares(pares: readonly ParGaleria[], valor: string): ParGaleria[] {
  return valor === TODOS ? [...pares] : pares.filter((p) => p.servicio === valor);
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
