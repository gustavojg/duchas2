import { randomUUID } from 'node:crypto';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import type { Deps } from '../app.js';
import { borrarFoto, detectarFoto, guardarFoto, type TipoFoto } from '../domain/foto.js';
import { hashIp, registrarIntento } from '../domain/rate-limit.js';
import {
  contactoSchema,
  erroresPorCampo,
  fotoDemasiadoGrande,
  MENSAJES,
  type Contacto,
  type Pieza,
} from '../../web/src/lib/contacto.js';

const MB = 1024 * 1024;

const NOMBRE_PIEZA: Record<Pieza, string> = {
  plato_ducha: 'Plato de ducha',
  banera: 'Bañera',
  azulejos: 'Azulejos',
  otro: 'Otro',
};

function textoEmail(d: Contacto, fecha: Date, foto: boolean): string {
  const linea = (etiqueta: string, valor: string | undefined) => `${etiqueta}: ${valor ?? '—'}`;
  return [
    'Nueva petición desde el formulario de la web.',
    '',
    linea('Nombre', d.nombre),
    linea('Teléfono', d.telefono),
    linea('Pieza', NOMBRE_PIEZA[d.pieza]),
    linea('Daño', d.dano),
    linea('Zona', d.zona),
    linea('Mensaje', d.mensaje),
    linea('Página de origen', d.pagina_origen),
    linea('Fecha', `${fecha.toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })} (${fecha.toISOString()})`),
    linea('Foto', foto ? 'adjunta' : 'sin foto'),
  ].join('\n');
}

/**
 * POST /api/contacto (multipart/form-data). Orden del contrato (brain/architecture.md §Contratos, ADR 0003/0006):
 * tamaño 413 → límite por IP 429 → honeypot 201 → zod 400 → tipo de foto por bytes 415 → guardar → email (503 y
 * se deshace si falla) → 201. La IP solo se guarda como HMAC y nunca va a los logs. Las fotos no se sirven.
 */
export function contactoRoutes(deps: Deps): Hono {
  const r = new Hono();
  const maxMb = deps.formulario.foto_max_mb;
  const demasiadoGrande = { error: 'demasiado_grande', mensaje: fotoDemasiadoGrande(maxMb) } as const;

  r.post(
    '/',
    bodyLimit({ maxSize: (maxMb + 1) * MB, onError: (c) => c.json(demasiadoGrande, 413) }),
    async (c) => {
      let body: Record<string, string | File>;
      try {
        body = await c.req.parseBody();
      } catch {
        return c.json({ error: 'validacion', campos: {} }, 400);
      }

      const foto = body.foto instanceof File && body.foto.size > 0 ? body.foto : null;
      if (foto && foto.size > maxMb * MB) return c.json(demasiadoGrande, 413);

      const ahora = deps.now();
      const permitido = registrarIntento(deps.db, {
        ipHash: hashIp(deps.clientIp(c), deps.ipSalt),
        ahora,
        limite: deps.formulario.limite_envios,
        ventanaMin: deps.formulario.ventana_min,
      });
      if (!permitido) return c.json({ error: 'limite' }, 429);

      // Honeypot: misma respuesta que un éxito para no dar pistas al bot.
      if (typeof body.web === 'string' && body.web.trim() !== '') return c.json({ ok: true }, 201);

      const campos = Object.fromEntries(Object.entries(body).filter(([, v]) => typeof v === 'string'));
      const parsed = contactoSchema.safeParse(campos);
      if (!parsed.success) return c.json({ error: 'validacion', campos: erroresPorCampo(parsed.error) }, 400);
      const datos = parsed.data;

      let bytes: Uint8Array | null = null;
      let tipo: TipoFoto | null = null;
      if (foto) {
        bytes = new Uint8Array(await foto.arrayBuffer());
        tipo = detectarFoto(bytes);
        if (!tipo) return c.json({ error: 'tipo_foto', mensaje: MENSAJES.foto_tipo }, 415);
      }

      const id = randomUUID();
      const t = ahora.getTime();
      const fichero = bytes && tipo ? guardarFoto(deps.dataDir, id, bytes, tipo.ext) : null;
      const deshacer = () => {
        deps.db.prepare('DELETE FROM peticiones WHERE id = ?').run(id);
        if (fichero) borrarFoto(deps.dataDir, fichero);
      };
      try {
        deps.db
          .prepare(
            `INSERT INTO peticiones (id, creada_en, nombre, telefono, pieza, dano, zona, mensaje, pagina_origen,
               foto_fichero, foto_mime, foto_bytes, privacidad_aceptada_en)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .run(
            id, t, datos.nombre, datos.telefono, datos.pieza, datos.dano ?? null, datos.zona ?? null,
            datos.mensaje ?? null, datos.pagina_origen ?? null, fichero, tipo?.mime ?? null, bytes?.length ?? null, t,
          );
      } catch (e) {
        deshacer();
        throw e;
      }

      try {
        if (!deps.emailDestino) throw new Error('sin email_destino');
        await deps.mailer.send({
          to: deps.emailDestino,
          subject: `Nueva petición: ${NOMBRE_PIEZA[datos.pieza]}${datos.zona ? ` en ${datos.zona}` : ''}`,
          text: textoEmail(datos, ahora, Boolean(fichero)),
          attachments:
            bytes && tipo && fichero ? [{ filename: fichero, content: Buffer.from(bytes), contentType: tipo.mime }] : [],
        });
      } catch (e) {
        deshacer();
        // Sin datos personales: ni el mensaje del error (puede llevar direcciones) ni campos del formulario.
        const codigo = (e as { code?: unknown }).code;
        console.error(
          `contacto: no se ha podido enviar la petición (${deps.emailDestino ? 'fallo del mailer' : 'sin email_destino'}` +
            `${e instanceof Error ? `, ${e.name}` : ''}${typeof codigo === 'string' ? ` ${codigo}` : ''})`,
        );
        return c.json({ error: 'envio' }, 503);
      }

      deps.db.prepare('UPDATE peticiones SET email_enviado_en = ? WHERE id = ?').run(deps.now().getTime(), id);
      return c.json({ ok: true }, 201);
    },
  );

  return r;
}
