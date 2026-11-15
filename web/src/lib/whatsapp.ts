/**
 * Enlaces de contacto (docs/ARCHITECTURE.md § Contratos): todo enlace a WhatsApp o al teléfono sale de aquí.
 * Puro: sin React, Next, node:* ni window.
 */

/** Dígitos del número con prefijo de país: quita espacios y signos, el 00 inicial, y añade 34 si faltaba. */
function digitos(numero: string): string {
  let d = numero.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 9) d = `34${d}`;
  return d;
}

/** `https://wa.me/<solo dígitos>?text=<encodeURIComponent(mensaje)>`. */
export function waLink(numero: string, mensaje: string): string {
  return `https://wa.me/${digitos(numero)}?text=${encodeURIComponent(mensaje)}`;
}

/** `tel:+34XXXXXXXXX`; admite espacios y los prefijos +34 o 0034. Lanza si no es un número español de 9 cifras. */
export function telLink(numero: string): string {
  const d = digitos(numero);
  if (!/^34[6-9]\d{8}$/.test(d)) throw new Error(`Teléfono no válido: «${numero}» (9 cifras que empiezan por 6-9)`);
  return `tel:+${d}`;
}
