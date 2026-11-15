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

/**
 * Claves de IconoServicioTipo de web/src/ui/art.tsx. Duplicadas aquí porque lib no puede importar de ui; si
 * art.tsx gana un icono, se añade también en esta lista.
 */
export const IMAGENES_TARJETA = [
  'plato',
  'banera',
  'banera-patas',
  'parcial',
  'perforada',
  'azulejos',
  'juntas',
  'mampara',
  'marmol',
  'hoteles',
] as const;

const cadena = z.string().min(1);
const rutaSchema = cadena.refine((r) => r.startsWith('/') && r.endsWith('/'), 'la ruta empieza y acaba en /');

export const servicioSchema = z
  .object({
    slug: cadena.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'el slug va en minúsculas y con guiones'),
    nombre: cadena,
    ruta: rutaSchema,
    tipo: z.enum(['principal', 'servicio', 'empresas']),
    orden: z.number().int().positive(),
    resumen: cadena.refine((t) => t.trim().split(/\s+/).length <= 20, 'el resumen tiene como mucho 20 palabras'),
    problema: cadena,
    como: z.array(cadena).min(1),
    precio_desde: entero,
    faqs: z.array(z.object({ p: cadena, r: cadena }).strict()),
    relacionados: z.array(cadena),
    whatsapp_mensaje: cadena,
    seo: z.object({ title: cadena, description: cadena }).strict(),
    imagen_tarjeta: z.enum(IMAGENES_TARJETA),
  })
  .strict();

/** Catálogo de servicios: slugs únicos, relacionados existentes, rutas coherentes y un solo principal. */
export const serviciosSchema = z
  .array(servicioSchema)
  .min(1)
  .superRefine((servicios, ctx) => {
    const slugs = new Set<string>();
    servicios.forEach((s, i) => {
      if (slugs.has(s.slug)) ctx.addIssue({ code: 'custom', path: [i, 'slug'], message: `slug repetido: ${s.slug}` });
      slugs.add(s.slug);
      if (s.tipo === 'servicio' && s.ruta !== `/servicios/${s.slug}/`)
        ctx.addIssue({ code: 'custom', path: [i, 'ruta'], message: `un servicio va en /servicios/${s.slug}/` });
    });
    servicios.forEach((s, i) =>
      s.relacionados.forEach((r, j) => {
        if (!slugs.has(r)) ctx.addIssue({ code: 'custom', path: [i, 'relacionados', j], message: `no existe el servicio ${r}` });
      }),
    );
    const principales = servicios.filter((s) => s.tipo === 'principal').length;
    if (principales !== 1)
      ctx.addIssue({ code: 'custom', path: [], message: `tiene que haber exactamente un servicio principal (hay ${principales})` });
  });

export type Servicio = z.infer<typeof servicioSchema>;

/** Claves de negocio.json que puede usar un paso como plazo. */
export const PLAZOS_PASO = ['plazos.presupuesto', 'plazos.respuesta', 'plazos.reparacion', 'plazos.uso_ducha', 'garantia.anios'] as const;

export const pasoSchema = z
  .object({
    numero: z.number().int().positive(),
    titulo: cadena,
    /** Plantilla con la clave del plazo entre llaves, p. ej. «Presupuesto gratuito {plazos.presupuesto}». */
    texto: cadena,
    /** Texto público si el plazo no está confirmado. */
    texto_sin_plazo: cadena,
    plazo: z.enum(PLAZOS_PASO).nullable(),
    accion: z.literal('whatsapp').nullable(),
    /** Mensaje prellenado del paso con acción de WhatsApp. */
    mensaje: cadena.optional(),
  })
  .strict()
  .refine((p) => p.accion !== 'whatsapp' || !!p.mensaje, { message: 'un paso de WhatsApp lleva mensaje', path: ['mensaje'] });

/** Los 4 pasos de «Cómo trabajamos», numerados 1-4 en orden. */
export const pasosSchema = z
  .array(pasoSchema)
  .length(4)
  .superRefine((pasos, ctx) =>
    pasos.forEach((p, i) => {
      if (p.numero !== i + 1) ctx.addIssue({ code: 'custom', path: [i, 'numero'], message: `el paso ${i + 1} lleva el número ${i + 1}` });
    }),
  );

export type Paso = z.infer<typeof pasoSchema>;

export const filaComparativaSchema = z.object({ id: cadena, etiqueta: cadena, reparar: texto, cambiar: texto }).strict();

export const comparativaSchema = z.object({ filas: z.array(filaComparativaSchema).min(1), fuente: cadena }).strict();

export type FilaComparativa = z.infer<typeof filaComparativaSchema>;
export type Comparativa = z.infer<typeof comparativaSchema>;

export const zonasSchema = z.object({ madrid_capital: z.array(cadena).min(1), municipios: z.array(cadena).min(1) }).strict();

export type Zonas = z.infer<typeof zonasSchema>;

export function cargarServicios(): Servicio[] {
  return leerContenido('servicios.json', serviciosSchema);
}

export function cargarPasos(): Paso[] {
  return leerContenido('pasos.json', pasosSchema);
}

export function cargarComparativa(): Comparativa {
  return leerContenido('comparativa.json', comparativaSchema);
}

export function cargarZonas(): Zonas {
  return leerContenido('zonas.json', zonasSchema);
}
