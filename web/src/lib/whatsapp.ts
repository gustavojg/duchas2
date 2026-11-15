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

/** Dígitos con prefijo 34 si el número es un teléfono español de 9 cifras que empieza por 6-9; si no, null. */
function numeroNormalizado(numero: string): string | null {
  const d = digitos(numero);
  return /^34[6-9]\d{8}$/.test(d) ? d : null;
}

/** Dígitos normalizados o lanza con el error común a telLink y waLink. */
function numeroOError(numero: string): string {
  const d = numeroNormalizado(numero);
  if (d === null) throw new Error(`Teléfono no válido: «${numero}» (9 cifras que empiezan por 6-9)`);
  return d;
}

/** true si telLink y waLink aceptan el número. Quien pinte un botón de contacto lo comprueba antes. */
export function esNumeroValido(numero: string): boolean {
  return numeroNormalizado(numero) !== null;
}

/**
 * `https://wa.me/<solo dígitos>?text=<encodeURIComponent(mensaje)>`.
 * Lanza si el número no es válido (misma validación y error que telLink): quien pinte un botón debe
 * comprobar antes `esNumeroValido(numero)` y no pintarlo si da false.
 */
export function waLink(numero: string, mensaje: string): string {
  return `https://wa.me/${numeroOError(numero)}?text=${encodeURIComponent(mensaje)}`;
}

/** `tel:+34XXXXXXXXX`; admite espacios y los prefijos +34 o 0034. Lanza si no es un número español de 9 cifras. */
export function telLink(numero: string): string {
  return `tel:+${numeroOError(numero)}`;
}
