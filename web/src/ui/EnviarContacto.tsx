'use client';

import { useEffect, useState } from 'react';
import { contactoSchema, erroresPorCampo, fotoDemasiadoGrande, MENSAJES } from '../lib/contacto';
import {
  type CampoEditable,
  type EstadoEnvio,
  FormularioContacto,
  VALORES_INICIALES,
  type ValoresContacto,
} from './FormularioContacto';

const MB = 1024 * 1024;
const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export interface ResultadoEnvio {
  estado: EstadoEnvio;
  errores: Record<string, string>;
}

/** Tamaño y tipo de la foto: el aviso que corresponde o undefined si se puede enviar. */
export function validarFoto(foto: File, fotoMaxMb: number): string | undefined {
  if (foto.size > fotoMaxMb * MB) return fotoDemasiadoGrande(fotoMaxMb);
  if (!TIPOS_FOTO.includes(foto.type.toLowerCase()) && !foto.name.toLowerCase().endsWith('.heic')) return MENSAJES.foto_tipo;
  return undefined;
}

/**
 * Validación en el navegador con el mismo esquema zod que el servidor (lib/contacto.ts) más el tamaño y el tipo
 * de la foto. Devuelve un mensaje por campo; vacío si se puede enviar.
 */
export function validarCliente(valores: ValoresContacto, foto: File | null, fotoMaxMb: number): Record<string, string> {
  const r = contactoSchema.safeParse({
    nombre: valores.nombre,
    telefono: valores.telefono,
    pieza: valores.pieza,
    dano: valores.dano,
    zona: valores.zona,
    mensaje: valores.mensaje,
    privacidad: valores.privacidad ? 'on' : undefined,
  });
  const errores = r.success ? {} : erroresPorCampo(r.error);
  const errorFoto = foto ? validarFoto(foto, fotoMaxMb) : undefined;
  if (errorFoto) errores.foto = errorFoto;
  return errores;
}

const esTexto = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

/** Traduce la respuesta de POST /api/contacto (contrato de brain/architecture.md) a estado y errores del formulario. */
export function interpretarRespuesta(status: number, cuerpo: unknown, fotoMaxMb = 10): ResultadoEnvio {
  const c = (cuerpo && typeof cuerpo === 'object' ? cuerpo : {}) as { campos?: unknown; mensaje?: unknown };
  if (status >= 200 && status < 300) return { estado: 'ok', errores: {} };
  if (status === 400) {
    const campos = c.campos && typeof c.campos === 'object' ? (c.campos as Record<string, unknown>) : {};
    const errores = Object.fromEntries(Object.entries(campos).filter(([, v]) => esTexto(v))) as Record<string, string>;
    return Object.keys(errores).length ? { estado: 'inicial', errores } : { estado: 'error', errores: {} };
  }
  if (status === 413) return { estado: 'inicial', errores: { foto: esTexto(c.mensaje) ? c.mensaje : fotoDemasiadoGrande(fotoMaxMb) } };
  if (status === 415) return { estado: 'inicial', errores: { foto: MENSAJES.foto_tipo } };
  if (status === 429) return { estado: 'limite', errores: {} };
  return { estado: 'error', errores: {} };
}

/** POST multipart a /api/contacto. Una caída de red o una respuesta rara terminan en estado `error`. */
export async function enviarContacto(
  valores: ValoresContacto,
  foto: File | null,
  paginaOrigen: string,
  fotoMaxMb: number,
): Promise<ResultadoEnvio> {
  const body = new FormData();
  body.set('nombre', valores.nombre);
  body.set('telefono', valores.telefono);
  body.set('pieza', valores.pieza);
  body.set('dano', valores.dano);
  body.set('zona', valores.zona);
  body.set('mensaje', valores.mensaje);
  if (valores.privacidad) body.set('privacidad', 'on');
  body.set('pagina_origen', paginaOrigen);
  body.set('web', valores.web);
  if (foto) body.set('foto', foto, foto.name);
  try {
    const res = await fetch('/api/contacto', { method: 'POST', body });
    let cuerpo: unknown = null;
    try {
      cuerpo = await res.json();
    } catch {
      // cuerpo vacío o HTML de un proxy: decide el estado HTTP
    }
    return interpretarRespuesta(res.status, cuerpo, fotoMaxMb);
  } catch {
    return { estado: 'error', errores: {} };
  }
}

export interface EnviarContactoProps {
  config: { retencion_dias: number; foto_max_mb: number };
  whatsapp: string | null;
  telefono: string | null;
  /** «Te respondemos …» resuelto en el servidor con respuesta(negocio.plazos.respuesta, modo). */
  plazoRespuesta: string;
  /** Mensaje de WhatsApp de la página (mensajePorRuta). */
  mensajeWhatsApp: string;
}

/**
 * Contenedor del formulario de contacto: guarda lo escrito y la foto, valida en el navegador (sin errores no hay
 * fetch), envía a POST /api/contacto y pinta FormularioContacto con el estado. Solo vacía los campos tras un 201.
 * Sin API routes ni server actions de Next: el endpoint es el de Hono.
 */
export function EnviarContacto({ config, whatsapp, telefono, plazoRespuesta, mensajeWhatsApp }: EnviarContactoProps) {
  const [valores, setValores] = useState<ValoresContacto>(VALORES_INICIALES);
  const [foto, setFoto] = useState<File | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<EstadoEnvio>('inicial');
  const [paginaOrigen, setPaginaOrigen] = useState('');

  useEffect(() => setPaginaOrigen(window.location.pathname), []);

  const onCambio = (campo: CampoEditable, valor: string | boolean) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErrores(({ [campo]: _quitado, ...resto }) => resto);
  };

  const onFoto = (archivo: File | null) => {
    setFoto(archivo);
    setValores((v) => ({ ...v, fotoNombre: archivo?.name ?? '' }));
    const error = archivo ? validarFoto(archivo, config.foto_max_mb) : undefined;
    setErrores(({ foto: _quitado, ...resto }) => (error ? { ...resto, foto: error } : resto));
  };

  const onEnviar = async () => {
    const e = validarCliente(valores, foto, config.foto_max_mb);
    setErrores(e);
    if (Object.keys(e).length) return;
    setEstado('enviando');
    const r = await enviarContacto(valores, foto, window.location.pathname, config.foto_max_mb);
    setErrores(r.errores);
    setEstado(r.estado);
    if (r.estado === 'ok') {
      setValores(VALORES_INICIALES);
      setFoto(null);
    }
  };

  return (
    <FormularioContacto
      valores={valores}
      errores={errores}
      estado={estado}
      config={config}
      contacto={{ whatsapp, telefono, mensajeWhatsApp, plazoRespuesta }}
      paginaOrigen={paginaOrigen}
      onCambio={onCambio}
      onFoto={onFoto}
      onEnviar={() => void onEnviar()}
    />
  );
}
