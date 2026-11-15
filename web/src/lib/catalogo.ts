/**
 * Qué se muestra del catálogo (servicios, pasos, comparativa) según los datos confirmados. Puro: sin React,
 * Next, node:* ni window. Los plazos y cifras se resuelven con dato.ts y textos.ts, nunca con literales.
 */
import type { Comparativa, Dato, Negocio, Paso, Servicio } from './content.ts';
import { confirmado, type Modo, texto } from './dato.ts';
import { garantia } from './textos.ts';

/** Servicios por `orden`, sin mutar la lista recibida. */
export function serviciosOrdenados(servicios: readonly Servicio[]): Servicio[] {
  return [...servicios].sort((a, b) => a.orden - b.orden);
}

export interface PasoResuelto {
  numero: number;
  titulo: string;
  texto: string;
  accion: 'whatsapp' | null;
}

type ClavePlazo = NonNullable<Paso['plazo']>;

/** Valor de negocio.json para la clave de plazo de un paso. */
function datoPlazo(negocio: Negocio, clave: Exclude<ClavePlazo, 'garantia.anios'>): Dato<string> {
  const [, nombre] = clave.split('.') as ['plazos', keyof Negocio['plazos']];
  return negocio.plazos[nombre];
}

/**
 * Textos de los pasos: `{plazos.x}` se sustituye solo si el plazo está confirmado (en modo pendientes, por
 * {{PENDIENTE}}); si no, sale `texto_sin_plazo`. `{garantia.anios}` se resuelve siempre con textos.garantia().
 */
export function resolverPasos(pasos: readonly Paso[], negocio: Negocio, modo: Modo): PasoResuelto[] {
  return pasos.map((p) => {
    let t = p.texto;
    if (p.plazo === 'garantia.anios') {
      t = t.replace('{garantia.anios}', garantia(negocio.garantia.anios, modo));
    } else if (p.plazo) {
      const valor = texto(datoPlazo(negocio, p.plazo), modo);
      t = valor ? t.replace(`{${p.plazo}}`, valor) : p.texto_sin_plazo;
    }
    return { numero: p.numero, titulo: p.titulo, texto: t, accion: p.accion };
  });
}

export interface FilaVisible {
  id: string;
  etiqueta: string;
  reparar: string;
  cambiar: string;
}

/** Filas de «¿Reparar o cambiar?» publicables: las dos columnas confirmadas (en modo pendientes, todas). */
export function filasComparativa(comparativa: Comparativa, modo: Modo): FilaVisible[] {
  return comparativa.filas
    .filter((f) => modo === 'pendientes' || (confirmado(f.reparar) && confirmado(f.cambiar)))
    .map((f) => ({ id: f.id, etiqueta: f.etiqueta, reparar: texto(f.reparar, modo), cambiar: texto(f.cambiar, modo) }));
}

/** Servicios con precio «desde» publicable: confirmado y mayor que 0 (en modo pendientes, todos). */
export function serviciosConPrecio(servicios: readonly Servicio[], modo: Modo): Servicio[] {
  if (modo === 'pendientes') return [...servicios];
  return servicios.filter((s) => confirmado(s.precio_desde) && s.precio_desde.valor > 0);
}
