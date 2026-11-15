/**
 * Contenido editable del producto (ADR 0002): JSON de web/content validado con zod. Un JSON inválido lanza un
 * Error con el fichero y el campo, y así rompe el build. Lo usan las páginas (en el build) y el servidor.
 * Puro salvo la lectura de ficheros (fs solo aquí y en config.ts); sin React, Next ni Astryx.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { z } from 'zod';

/** Dato comercial: solo se publica si el cliente lo ha confirmado (dato.ts / textos.ts deciden el texto). */
export interface Dato<T> {
  valor: T | null;
  confirmado: boolean;
}

export const datoSchema = <T extends z.ZodTypeAny>(valor: T) =>
  z.object({ valor: valor.nullable(), confirmado: z.boolean() }).strict();

const texto = datoSchema(z.string().min(1));
const entero = datoSchema(z.number().int().nonnegative());

export const negocioSchema = z
  .object({
    marca: texto,
    telefono: texto,
    whatsapp: texto,
    email: texto,
    email_destino: texto,
    horario: texto,
    legal: z.object({ razon_social: texto, nif: texto, domicilio: texto }).strict(),
    anios: entero,
    garantia: z.object({ anios: entero, condiciones: texto }).strict(),
    plazos: z.object({ presupuesto: texto, respuesta: texto, reparacion: texto, uso_ducha: texto }).strict(),
    url_base: z.string().url(),
    analitica: z.object({ ga4_id: z.string().min(1).nullable() }).strict(),
  })
  .strict();

export type Negocio = z.infer<typeof negocioSchema>;

/**
 * Directorio del contenido: CONTENT_DIR si está definido; si no, web/content resuelto desde el cwd (web/ en
 * next build y en el vitest de web; la raíz del repo en el servidor y en el vitest de la raíz).
 */
export function contentDir(): string {
  if (process.env.CONTENT_DIR) return resolve(process.env.CONTENT_DIR);
  const cwd = process.cwd();
  for (const dir of [join(cwd, 'content'), join(cwd, 'web', 'content')]) {
    if (existsSync(join(dir, 'negocio.json'))) return dir;
  }
  throw new Error(`No se encuentra web/content desde ${cwd}; define CONTENT_DIR`);
}

/** Lee y valida un JSON de contenido; el error dice el fichero y cada campo que falla. */
export function leerContenido<S extends z.ZodTypeAny>(fichero: string, schema: S): z.infer<S> {
  const ruta = join(contentDir(), fichero);
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(ruta, 'utf8'));
  } catch (e) {
    throw new Error(`${fichero}: no se puede leer como JSON (${(e as Error).message})`);
  }
  const r = schema.safeParse(data);
  if (!r.success) {
    const campos = r.error.issues.map((i) => `campo ${i.path.join('.') || '(raíz)'}: ${i.message}`);
    throw new Error(`${fichero} no es válido: ${campos.join('; ')}`);
  }
  return r.data;
}

export function cargarNegocio(): Negocio {
  return leerContenido('negocio.json', negocioSchema);
}
