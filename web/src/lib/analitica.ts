/**
 * Analítica opt-in (cookies): GA4 solo tras «Aceptar» y solo con un `analitica.ga4_id` válido en negocio.json.
 * Puro: sin React, Next, node:* ni window; el almacenamiento entra por parámetro (localStorage en BannerCookies).
 */

/** Clave de localStorage con la elección del visitante. */
export const CLAVE_ELECCION = 'cookies-eleccion';

export type Eleccion = 'aceptadas' | 'rechazadas';

/** Id de medición de GA4 («G-» y al menos 4 mayúsculas o dígitos). */
export function ga4IdValido(id: string | null | undefined): boolean {
  return typeof id === 'string' && /^G-[A-Z0-9]{4,}$/.test(id);
}

/** URL de gtag.js para el id. */
export function urlGa4(id: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
}

/** Elección guardada, o null si no hay, no es válida o el almacenamiento no se puede leer. */
export function leerEleccion(storage: Pick<Storage, 'getItem'>): Eleccion | null {
  try {
    const v = storage.getItem(CLAVE_ELECCION);
    return v === 'aceptadas' || v === 'rechazadas' ? v : null;
  } catch {
    return null;
  }
}

/** Guarda la elección; si el almacenamiento falla (modo privado) no propaga el error. */
export function guardarEleccion(storage: Pick<Storage, 'setItem'>, eleccion: Eleccion): void {
  try {
    storage.setItem(CLAVE_ELECCION, eleccion);
  } catch {
    // Sin almacenamiento la elección dura lo que la página.
  }
}
