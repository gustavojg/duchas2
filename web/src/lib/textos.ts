/**
 * Tabla vinculante del PRD (§ «Regla común: datos confirmados y textos alternativos»): una función por fila.
 * Columna 1 si el dato está confirmado; columna 2 (texto que no promete nada) si no. Los componentes no
 * escriben plazos ni cifras: los piden aquí. Puro: sin React, Next, node:* ni window.
 *
 * Forma de los valores en web/content/negocio.json:
 * - plazos.presupuesto, plazos.respuesta y plazos.reparacion son frases cortas que siguen al verbo:
 *   «en 24 h», «en menos de 24 h», «en unas horas» / «en el día».
 * - anios y garantia.anios son enteros; 0 no se publica nunca.
 */
import type { Dato } from './content.js';
import { confirmado, type Modo, PENDIENTE, texto } from './dato.js';

const plural = (n: number) => (n === 1 ? `${n} año` : `${n} años`);

/** Cifra publicable: confirmada y mayor que 0. Un 0 o un null cuentan como no confirmados. */
const cifra = (dato: Dato<number>): Dato<number> =>
  confirmado(dato) && dato.valor > 0 ? dato : { valor: dato.valor, confirmado: false };

/** Plazo de presupuesto: «Presupuesto gratuito en 24 h» / «Presupuesto gratuito y sin compromiso». */
export function presupuesto(dato: Dato<string>, modo: Modo): string {
  return texto(dato, modo, { formato: (v) => `Presupuesto gratuito ${v}`, alternativo: 'Presupuesto gratuito y sin compromiso' });
}

/** Duración de la reparación: «Reparado en unas horas» / «Sin obras ni polvo». */
export function reparacion(dato: Dato<string>, modo: Modo): string {
  return texto(dato, modo, { formato: (v) => `Reparado ${v}`, alternativo: 'Sin obras ni polvo' });
}

/** Plazo de respuesta al formulario: «Te respondemos en menos de 24 h» / «Te respondemos lo antes posible». */
export function respuesta(dato: Dato<string>, modo: Modo): string {
  return texto(dato, modo, { formato: (v) => `Te respondemos ${v}`, alternativo: 'Te respondemos lo antes posible' });
}

/** Años de experiencia: «{N} años reparando baños» / nada (el dato se oculta). */
export function anios(dato: Dato<number>, modo: Modo): string {
  return texto(cifra(dato), modo, { formato: (n) => `${plural(n)} reparando baños` });
}

/** Garantía: «Garantía por escrito de {N} años» / «Garantía por escrito» (+ {{PENDIENTE}} del plazo en local). */
export function garantia(dato: Dato<number>, modo: Modo): string {
  const d = cifra(dato);
  if (confirmado(d)) return `Garantía por escrito de ${plural(d.valor)}`;
  return modo === 'pendientes' ? `Garantía por escrito de ${PENDIENTE}` : 'Garantía por escrito';
}

/** Precio «desde»: «Desde {X} €» / «Pide presupuesto gratuito». */
export function precioDesde(dato: Dato<number>, modo: Modo): string {
  return texto(cifra(dato), modo, { formato: (x) => `Desde ${x} €`, alternativo: 'Pide presupuesto gratuito' });
}

/**
 * H1 de la portada (PRD F1): reparar sin obras y con garantía; «en unas horas» o «en el día» solo si
 * plazos.reparacion está confirmado.
 */
export function titularPortada(plazoReparacion: Dato<string>, modo: Modo): string {
  const plazo = texto(plazoReparacion, modo);
  return `Tu plato de ducha se repara${plazo ? ` ${plazo}` : ''}. Sin obras y con garantía.`;
}
