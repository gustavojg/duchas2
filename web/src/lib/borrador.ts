/**
 * Modo borrador (ADR 0005): mientras falte algún dato legal o comercial imprescindible, todo el sitio sale con
 * noindex y el build avisa en consola. Puro: sin React, Next, node:* ni window.
 */
import type { Negocio } from './content.ts';
import { confirmado } from './dato.ts';

/** Etiquetas de los datos imprescindibles sin confirmar, en orden fijo. */
export function datosFaltantes(negocio: Negocio): string[] {
  const faltan: string[] = [];
  if (!confirmado(negocio.legal.razon_social)) faltan.push('razón social');
  if (!confirmado(negocio.legal.nif)) faltan.push('NIF');
  if (!confirmado(negocio.legal.domicilio)) faltan.push('domicilio');
  if (!confirmado(negocio.telefono)) faltan.push('teléfono');
  // 0 años no se publica nunca (igual que en textos.ts): cuenta como no confirmado.
  const g = negocio.garantia.anios;
  if (!confirmado(g) || g.valor === 0) faltan.push('plazo de garantía');
  return faltan;
}

export function esBorrador(negocio: Negocio): boolean {
  return datosFaltantes(negocio).length > 0;
}

/** Aviso del build; '' si no falta nada. */
export function avisoBorrador(faltantes: string[]): string {
  if (faltantes.length === 0) return '';
  return `⚠ MODO BORRADOR: faltan ${faltantes.join(', ')}. Todo el sitio sale con noindex hasta confirmarlos en web/content/negocio.json`;
}
