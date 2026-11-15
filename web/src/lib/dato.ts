/**
 * Regla de datos confirmados (ADR 0002): un dato comercial solo se publica si el cliente lo ha confirmado. Si
 * no, el visitante ve el texto alternativo y, en local (modo `pendientes`), el marcador {{PENDIENTE}} para que
 * el cliente detecte el hueco. Puro: sin React, Next, node:* ni window.
 */
import type { Dato } from './content.ts';

export type Modo = 'pendientes' | 'publico';

export const PENDIENTE = '{{PENDIENTE}}';

/** `pendientes` en `next dev` o con MOSTRAR_PENDIENTES=1; `publico` en el resto, incluido el build. */
export function modoActual(env: Record<string, string | undefined> = process.env): Modo {
  return env.NODE_ENV === 'development' || env.MOSTRAR_PENDIENTES === '1' ? 'pendientes' : 'publico';
}

/** Un dato cuenta como confirmado solo si lo está y tiene valor. */
export function confirmado<T>(dato: Dato<T>): dato is { valor: T; confirmado: true } {
  return dato.confirmado && dato.valor !== null && dato.valor !== undefined;
}

export interface OpcionesTexto<T> {
  /** Texto público si el dato no está confirmado (vacío: el dato no aparece). */
  alternativo?: string;
  /** Cómo se escribe el valor confirmado (por defecto, tal cual). */
  formato?: (valor: T) => string;
}

/** Texto confirmado, alternativo o {{PENDIENTE}} según el dato y el modo. */
export function texto<T>(dato: Dato<T>, modo: Modo, { alternativo = '', formato }: OpcionesTexto<T> = {}): string {
  if (confirmado(dato)) return formato ? formato(dato.valor) : String(dato.valor);
  return modo === 'pendientes' ? PENDIENTE : alternativo;
}
