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

/** Mensaje de WhatsApp de la portada; también el de /contacto/ y el de cualquier ruta sin mensaje propio. */
export const MENSAJE_PORTADA = 'Hola, os mando una foto del daño para que me digáis si tiene arreglo.';

const MENSAJE_EMPRESAS = 'Hola, somos un hotel o una comunidad y queremos renovar bañeras. Os cuento cuántas y cuándo.';

const vengoDe = (pagina: string) => `Hola, vengo de la página de ${pagina}. Os mando una foto del daño`;

/**
 * Ids de los elementos con un botón primario de WhatsApp o de envío: mientras alguno esté visible, el botón
 * flotante se oculta para no sumar otro primario en pantalla (BotonFlotanteWhatsApp).
 */
export const IDS_SIN_FLOTANTE = ['cta-hero', 'enviar-peticion'] as const;

/** Servicio con mensaje propio (web/content/servicios.json, cuando exista): lo pasa quien llama. */
export interface ServicioMensaje {
  ruta: string;
  whatsapp_mensaje: string;
}

/** Ruta sin query, hash ni barra final («/» se queda como «/»). */
function normalizar(ruta: string): string {
  const sin = ruta.split(/[?#]/)[0].replace(/\/+$/, '');
  return sin === '' ? '/' : sin;
}

/** Mensaje prellenado de WhatsApp según la página de origen. Nunca vacío. */
export function mensajePorRuta(ruta: string, servicios: readonly ServicioMensaje[] = []): string {
  const r = normalizar(ruta);
  const servicio = servicios.find((s) => normalizar(s.ruta) === r && s.whatsapp_mensaje.trim() !== '');
  if (servicio) return servicio.whatsapp_mensaje;
  if (r === '/platos-de-ducha') return vengoDe('platos de ducha');
  if (r === '/hoteles-y-comunidades') return MENSAJE_EMPRESAS;
  const slug = /^\/servicios\/([^/]+)$/.exec(r)?.[1];
  if (slug) {
    let legible = slug;
    try {
      legible = decodeURIComponent(slug);
    } catch {
      // slug mal codificado: se usa tal cual
    }
    legible = legible.replace(/[-_]+/g, ' ').trim();
    if (legible) return vengoDe(legible);
  }
  return MENSAJE_PORTADA;
}

/** `tel:+34XXXXXXXXX`; admite espacios y los prefijos +34 o 0034. Lanza si no es un número español de 9 cifras. */
export function telLink(numero: string): string {
  const d = digitos(numero);
  if (!/^34[6-9]\d{8}$/.test(d)) throw new Error(`Teléfono no válido: «${numero}» (9 cifras que empiezan por 6-9)`);
  return `tel:+${d}`;
}
