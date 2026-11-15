/**
 * Respuestas de la FAQ (faq.json) con plantillas de dato: los plazos, la garantía y la retención de la foto
 * van como marcadores `{...}` y se resuelven aquí con textos.ts y dato.ts, así que nunca salen sin confirmar.
 * Un marcador desconocido lanza un Error y rompe el build. Puro: sin React, Next, node:* ni window.
 */
import type { Faq, Negocio } from './content.ts';
import { type Modo, texto } from './dato.ts';
import { garantia, presupuesto, reparacion, respuesta } from './textos.ts';

export interface ContextoFaq {
  negocio: Negocio;
  retencion_dias: number;
  modo: Modo;
}

export interface PreguntaResuelta {
  p: string;
  r: string;
  en_portada: boolean;
}

export interface TemaResuelto {
  tema: string;
  ancla: string;
  preguntas: PreguntaResuelta[];
}

const MARCADORES: Record<string, (ctx: ContextoFaq) => string> = {
  presupuesto: ({ negocio, modo }) => presupuesto(negocio.plazos.presupuesto, modo),
  reparacion: ({ negocio, modo }) => reparacion(negocio.plazos.reparacion, modo),
  respuesta: ({ negocio, modo }) => respuesta(negocio.plazos.respuesta, modo),
  garantia: ({ negocio, modo }) => garantia(negocio.garantia.anios, modo),
  uso_ducha: ({ negocio, modo }) =>
    texto(negocio.plazos.uso_ducha, modo, {
      formato: (v) => `Puedes usar la ducha ${v}`,
      alternativo: 'Te decimos cuándo puedes usar la ducha',
    }),
  retencion_dias: ({ retencion_dias }) => String(retencion_dias),
};

/** Sustituye cada `{marcador}` de la respuesta por su texto según el dato y el modo. */
export function respuestaFaq(r: string, ctx: ContextoFaq): string {
  return r.replace(/\{([^{}]*)\}/g, (_, nombre: string) => {
    const resolver = MARCADORES[nombre];
    if (!resolver) throw new Error(`faq.json: marcador desconocido {${nombre}}`);
    return resolver(ctx);
  });
}

/** Slug ASCII del tema para usarlo como ancla: «Plazos, presupuesto y garantía» → «plazos-presupuesto-y-garantia». */
export function anclaTema(tema: string): string {
  return tema
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Temas con su ancla y las respuestas ya resueltas; la misma lista alimenta la página y el JSON-LD. */
export function preguntasResueltas(faq: Faq, ctx: ContextoFaq): TemaResuelto[] {
  return faq.temas.map((t) => ({
    tema: t.tema,
    ancla: anclaTema(t.tema),
    preguntas: t.preguntas.map((q) => ({ p: q.p, r: respuestaFaq(q.r, ctx), en_portada: q.en_portada })),
  }));
}
