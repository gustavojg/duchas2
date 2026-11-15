/**
 * Validación del formulario de contacto: una sola fuente para la web (FormularioContacto) y el servidor
 * (POST /api/contacto). Pura: sin node:*, React ni Next. Los textos de error salen de brain/design.md §Textos.
 */
import { z, type ZodError } from 'zod';

export const PIEZAS = ['plato_ducha', 'banera', 'azulejos', 'otro'] as const;
export type Pieza = (typeof PIEZAS)[number];

export const MENSAJES = {
  nombre: 'Dinos tu nombre.',
  nombre_largo: 'El nombre es demasiado largo.',
  telefono_falta: 'Falta tu teléfono.',
  telefono_cifras: 'El teléfono tiene que tener 9 cifras.',
  pieza: 'Elige qué quieres reparar.',
  dano: 'Describe el daño en menos palabras.',
  zona: 'Escribe la zona en menos palabras.',
  mensaje: 'El mensaje es demasiado largo; resúmelo un poco.',
  pagina_origen: 'La página de origen es demasiado larga.',
  privacidad: 'Marca la casilla de privacidad para enviar.',
  foto_tipo: 'Solo se admiten fotos (JPG, PNG, WebP o HEIC)',
} as const;

/** Texto del 413 (brain/design.md §Errores) con el límite de foto_max_mb de web/content/config.json. */
export const fotoDemasiadoGrande = (mb: number) => `La foto pesa más de ${mb} MB; prueba con otra o envíala por WhatsApp`;

/** Quita espacios, puntos y guiones; admite +34/0034. Devuelve +34XXXXXXXXX (9 cifras, empieza por 6-9) o null. */
export function normalizarTelefono(raw: string): string | null {
  let t = raw.replace(/[\s.-]/g, '');
  if (t.startsWith('+34')) t = t.slice(3);
  else if (t.startsWith('0034')) t = t.slice(4);
  return /^[6-9]\d{8}$/.test(t) ? `+34${t}` : null;
}

const vacioAusente = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);
const opcional = (max: number, message: string) =>
  z.preprocess(vacioAusente, z.string().trim().max(max, message).optional());

export const contactoSchema = z.object({
  nombre: z.preprocess(
    (v) => (v === undefined || v === null ? '' : v),
    z.string({ invalid_type_error: MENSAJES.nombre }).trim().min(1, MENSAJES.nombre).max(100, MENSAJES.nombre_largo),
  ),
  telefono: z.preprocess(
    (v) => (v === undefined || v === null ? '' : v),
    z.string({ invalid_type_error: MENSAJES.telefono_falta }).transform((v, ctx) => {
      if (v.trim() === '') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: MENSAJES.telefono_falta });
        return z.NEVER;
      }
      const n = normalizarTelefono(v);
      if (!n) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: MENSAJES.telefono_cifras });
        return z.NEVER;
      }
      return n;
    }),
  ),
  pieza: z.enum(PIEZAS, { errorMap: () => ({ message: MENSAJES.pieza }) }),
  dano: opcional(100, MENSAJES.dano),
  zona: opcional(100, MENSAJES.zona),
  mensaje: opcional(2000, MENSAJES.mensaje),
  privacidad: z.literal('on', { errorMap: () => ({ message: MENSAJES.privacidad }) }),
  pagina_origen: opcional(300, MENSAJES.pagina_origen),
  /** Honeypot: invisible para personas; si viene relleno, el servidor responde 201 sin guardar ni enviar. */
  web: z.preprocess(vacioAusente, z.string().optional()),
});

export type ContactoEntrada = z.input<typeof contactoSchema>;
export type Contacto = z.output<typeof contactoSchema>;

/** Primer mensaje de error por campo: `{ telefono: 'El teléfono tiene que tener 9 cifras.' }`. */
export function erroresPorCampo(error: ZodError): Record<string, string> {
  const campos: Record<string, string> = {};
  for (const issue of error.issues) {
    const campo = String(issue.path[0] ?? '_');
    if (!(campo in campos)) campos[campo] = issue.message;
  }
  return campos;
}
