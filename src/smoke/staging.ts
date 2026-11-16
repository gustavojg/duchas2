/**
 * Plan del smoke de staging (tests/e2e/staging-smoke.spec.ts). Puro: sin process.env, red ni disco; el spec le
 * pasa los servicios de cargarServicios() y el valor de E2E_EMAIL_DESTINO.
 */
import { rutasCanonicas } from '../../web/src/lib/rutas.js';

/** Rutas que recorre el smoke: PAGES más las de los servicios de tipo 'servicio' (como tests/build/out.test.ts). */
export function rutasDelSmoke(servicios: readonly { slug: string; ruta?: string; tipo: string }[]): string[] {
  return rutasCanonicas(servicios.filter((s) => s.tipo === 'servicio'));
}

export type EsperadoContacto = 'con' | 'sin';

/** Lee E2E_EMAIL_DESTINO: vacío o 'con' → 'con'; 'sin' → 'sin'; cualquier otro valor lanza. */
export function esperadoContacto(valor: string | undefined): EsperadoContacto {
  const v = valor?.trim() ?? '';
  if (v === '' || v === 'con') return 'con';
  if (v === 'sin') return 'sin';
  throw new Error(`E2E_EMAIL_DESTINO debe ser «con» o «sin» (o no estar definida); recibido: «${valor}»`);
}

/** Estado aceptable de POST /api/contacto: 'sin' destino solo 503; 'con' destino cualquier 2xx. */
export function statusContactoEsperado(esperado: EsperadoContacto): (status: number) => boolean {
  return esperado === 'sin' ? (s) => s === 503 : (s) => s >= 200 && s < 300;
}
