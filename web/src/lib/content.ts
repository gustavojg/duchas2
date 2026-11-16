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
    /** Única base del canonical, sitemap.xml y robots.txt (ADR 0005). Dominio de producción antes de publicar. */
    url_base: z.string().url(),
    /** Recordatorio para quien edita el JSON (no admite comentarios); no se publica. */
    url_base_nota: z.string().optional(),
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
/** Ruta interna del sitio: nunca «//» (relativa al protocolo), esquema («:») ni «\» (algunos navegadores la leen como «/»). */
const rutaSchema = cadena
  .refine((r) => r.startsWith('/') && r.endsWith('/'), 'la ruta empieza y acaba en /')
  .refine((r) => !r.startsWith('//'), 'la ruta no puede empezar por //')
  .refine((r) => !r.includes(':'), 'la ruta no puede llevar esquema (ningún «:»)')
  .refine((r) => !r.includes('\\'), 'la ruta no puede llevar barras invertidas (\\)');

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
    faqs: z.array(z.object({ p: cadena, r: cadena }).strict()).min(2).max(4),
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
      if (s.tipo === 'principal' && s.ruta !== '/platos-de-ducha/')
        ctx.addIssue({ code: 'custom', path: [i, 'ruta'], message: 'el servicio principal va en /platos-de-ducha/' });
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

/** Foto de la galería: solo WebP de web/public/fotos (`/fotos/<nombre>.webp`). */
const foto = z
  .string()
  .regex(/^\/fotos\/[a-z0-9-]+\.webp$/, 'debe ser /fotos/<nombre>.webp')
  .nullable();

/** Pares antes/después (galeria.json). Sin fotos, `hueco` dice qué foto falta y se pinta la ilustración. */
export const galeriaSchema = z.array(
  z
    .object({
      servicio: z.string().regex(/^[a-z0-9-]+$/, 'debe ser un slug'),
      antes: foto,
      despues: foto,
      alt_antes: z.string().min(1),
      alt_despues: z.string().min(1),
      hueco: z.string().min(1).optional(),
    })
    .strict()
    .superRefine((par, ctx) => {
      if (par.hueco) return;
      for (const campo of ['antes', 'despues'] as const) {
        if (par[campo] === null) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [campo], message: 'obligatoria si no hay `hueco`' });
        }
      }
    }),
);

export type ParGaleria = z.infer<typeof galeriaSchema>[number];

export function cargarGaleria(): ParGaleria[] {
  return leerContenido('galeria.json', galeriaSchema);
}

const preguntaSchema = z.object({ p: z.string().min(1), r: z.string().min(1), en_portada: z.boolean() }).strict();

/**
 * FAQ (faq.json). Las respuestas no llevan cifras: los plazos y números salen de los marcadores `{...}` que
 * resuelve faq.ts con textos.ts. Entre 4 y 6 preguntas van a la FAQ resumida de la portada.
 */
export const faqSchema = z
  .object({
    temas: z
      .array(z.object({ tema: z.string().min(1), preguntas: z.array(preguntaSchema).min(1) }).strict())
      .min(1),
  })
  .strict()
  .superRefine((faq, ctx) => {
    const enPortada = faq.temas.flatMap((t) => t.preguntas).filter((p) => p.en_portada).length;
    if (enPortada < 4 || enPortada > 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['temas'],
        message: `entre 4 y 6 preguntas con en_portada (hay ${enPortada})`,
      });
    }
    faq.temas.forEach((t, i) =>
      t.preguntas.forEach((p, j) => {
        if (/\d/.test(p.r.replace(/\{[^}]*\}/g, ''))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['temas', i, 'preguntas', j, 'r'],
            message: 'sin cifras literales: usa un marcador como {reparacion}',
          });
        }
      }),
    );
  });

export type Faq = z.infer<typeof faqSchema>;
export type PreguntaFaq = Faq['temas'][number]['preguntas'][number];

export function cargarFaq(): Faq {
  return leerContenido('faq.json', faqSchema);
}

/** Claves de Dano de web/src/ui/art.tsx (lib no importa de ui): si art.tsx gana un daño, se añade aquí. */
export const DANOS = ['grieta', 'golpe', 'desconchon', 'perforacion', 'oxido', 'brillo'] as const;

const palabras = (t: string) => t.trim().split(/\s+/).length;
/** Sin cifras fuera de los marcadores `{...}`: los plazos los pone faq.ts con datos confirmados. */
const sinCifras = (t: string) => !/\d/.test(t.replace(/\{[^}]*\}/g, ''));
const MENSAJE_CIFRAS = 'sin cifras literales: usa un marcador como {uso_ducha}';

const bloqueTexto = z.object({ titulo: cadena, texto: cadena }).strict();

/**
 * Página larga del plato de ducha (plato-ducha.json, PRD F2): H1 con «plato de ducha» y «Madrid», 6 daños
 * (uno por ilustración de art.tsx) de 80-150 palabras, materiales con su dato confirmado, proceso con el
 * curado como plantilla ({uso_ducha}) y al menos 5 FAQ cuyas respuestas no llevan cifras.
 */
export const platoDuchaSchema = z
  .object({
    h1: cadena.refine((t) => t.includes('plato de ducha') && t.includes('Madrid'), 'el h1 lleva «plato de ducha» y «Madrid»'),
    danos: z
      .array(
        z
          .object({
            id: z.enum(DANOS),
            titulo: cadena,
            texto: cadena.refine((t) => palabras(t) >= 80 && palabras(t) <= 150, 'el texto de un daño tiene de 80 a 150 palabras'),
          })
          .strict(),
      )
      .length(6)
      .superRefine((danos, ctx) => {
        const vistos = new Set<string>();
        danos.forEach((d, i) => {
          if (vistos.has(d.id)) ctx.addIssue({ code: 'custom', path: [i, 'id'], message: `daño repetido: ${d.id}` });
          vistos.add(d.id);
        });
      }),
    antideslizante: bloqueTexto,
    cambio_color: bloqueTexto,
    materiales: z.array(z.object({ nombre: cadena, reparable: datoSchema(z.boolean()) }).strict()).min(1),
    proceso: z
      .object({
        titulo: cadena,
        intro: cadena,
        /** Plantilla del curado con {uso_ducha}, resuelta con respuestaFaq() de faq.ts. */
        curado: cadena.refine(sinCifras, MENSAJE_CIFRAS).refine((t) => t.includes('{uso_ducha}'), 'el curado lleva {uso_ducha}'),
      })
      .strict(),
    faqs: z.array(z.object({ p: cadena, r: cadena.refine(sinCifras, MENSAJE_CIFRAS) }).strict()).min(5),
  })
  .strict();

export type PlatoDucha = z.infer<typeof platoDuchaSchema>;

export function cargarPlatoDucha(): PlatoDucha {
  return leerContenido('plato-ducha.json', platoDuchaSchema);
}

/** Reseñas reales (resenas.json, ARCHITECTURE §4.1). Vacío ⇒ ni bloque ni AggregateRating. */
export const resenasSchema = z.array(
  z
    .object({
      autor: z.string().min(1),
      nota: z.number().int().min(1).max(5),
      texto: z.string().min(1),
      fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'debe ser YYYY-MM-DD'),
      fuente: z.string().min(1),
    })
    .strict(),
);

export type Resena = z.infer<typeof resenasSchema>[number];

export function cargarResenas(): Resena[] {
  return leerContenido('resenas.json', resenasSchema);
}

/** Referencias reales de hoteles y comunidades (referencias.json). Vacío ⇒ la sección no aparece; nunca se inventan. */
export const referenciasSchema = z.array(z.object({ nombre: cadena, tipo: cadena, texto: cadena }).strict());

export type Referencia = z.infer<typeof referenciasSchema>[number];

export function cargarReferencias(): Referencia[] {
  return leerContenido('referencias.json', referenciasSchema);
}
