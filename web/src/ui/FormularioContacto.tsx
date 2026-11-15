'use client';

import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Field } from '@astryxdesign/core/Field';
import { HStack } from '@astryxdesign/core/HStack';
import { Link } from '@astryxdesign/core/Link';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Selector } from '@astryxdesign/core/Selector';
import { Text } from '@astryxdesign/core/Text';
import { TextArea } from '@astryxdesign/core/TextArea';
import { TextInput } from '@astryxdesign/core/TextInput';
import { VStack } from '@astryxdesign/core/VStack';
import type { ReactNode } from 'react';
import { PIEZAS, type Pieza } from '../lib/contacto';
import { telLink } from '../lib/whatsapp';
import { IconoServicio, type IconoServicioTipo } from './art';
import { BotonLlamar } from './BotonLlamar';
import { BotonWhatsApp } from './BotonWhatsApp';
import { CampoFoto } from './CampoFoto';

export type EstadoEnvio = 'inicial' | 'enviando' | 'ok' | 'limite' | 'error';

export interface ValoresContacto {
  nombre: string;
  telefono: string;
  pieza: Pieza;
  dano: string;
  zona: string;
  mensaje: string;
  privacidad: boolean;
  /** Nombre de la foto elegida (el archivo lo guarda el contenedor); vacío sin foto. */
  fotoNombre: string;
  /** Honeypot: siempre vacío para personas. */
  web: string;
}

/** Campos que se editan con onCambio (la foto va por onFoto). */
export type CampoEditable = Exclude<keyof ValoresContacto, 'fotoNombre'>;

export const VALORES_INICIALES: ValoresContacto = {
  nombre: '',
  telefono: '',
  pieza: 'plato_ducha',
  dano: '',
  zona: '',
  mensaje: '',
  privacidad: false,
  fotoNombre: '',
  web: '',
};

export interface FormularioContactoProps {
  valores: ValoresContacto;
  /** Mensaje por campo (de lib/contacto.ts o de la respuesta del servidor); `foto` para 413/415. */
  errores: Record<string, string>;
  estado: EstadoEnvio;
  config: { retencion_dias: number; foto_max_mb: number };
  contacto: {
    whatsapp: string | null;
    telefono: string | null;
    mensajeWhatsApp: string;
    /** «Te respondemos …» ya resuelto con respuesta() de textos.ts. */
    plazoRespuesta: string;
  };
  /** Ruta desde la que se envía (campo oculto pagina_origen). */
  paginaOrigen?: string;
  onCambio: (campo: CampoEditable, valor: string | boolean) => void;
  onFoto: (archivo: File | null) => void;
  onEnviar: () => void;
}

const NOMBRE_PIEZA: Record<Pieza, { label: string; icono: IconoServicioTipo }> = {
  plato_ducha: { label: 'Plato de ducha', icono: 'plato' },
  banera: { label: 'Bañera', icono: 'banera' },
  azulejos: { label: 'Azulejos', icono: 'azulejos' },
  otro: { label: 'Otro', icono: 'marmol' },
};

/** Daños del glosario (brain/CONTEXT.md). Es una pista para quien rellena; el campo admite texto libre. */
const DANOS = ['Grieta', 'Golpe', 'Desconchón', 'Perforación', 'Manchas u óxido', 'Pérdida de brillo'];

/** Llamar y WhatsApp (secundario) para los avisos de 429 y error, si hay número. */
function Vias({ contacto }: Pick<FormularioContactoProps, 'contacto'>) {
  return (
    <HStack gap={2} wrap="wrap" vAlign="center">
      {contacto.telefono ? <BotonLlamar href={telLink(contacto.telefono)} etiqueta="Llamar" /> : null}
      {contacto.whatsapp ? (
        <BotonWhatsApp numero={contacto.whatsapp} mensaje={contacto.mensajeWhatsApp} etiqueta="WhatsApp" variante="secondary" />
      ) : null}
    </HStack>
  );
}

function Aviso({ status, titulo, children }: { status: 'success' | 'warning' | 'error'; titulo: string; children: ReactNode }) {
  return (
    <VStack role={status === 'success' ? 'status' : 'alert'}>
      <Banner status={status} title={titulo} collapsible={false}>
        {children}
      </Banner>
    </VStack>
  );
}

const error = (msg: string | undefined) => (msg ? { type: 'error' as const, message: msg } : undefined);

/**
 * Formulario de contacto PURO (brain/design.md § Formulario y § Textos): todo el estado entra por props y cada
 * cambio sale por callbacks; no hace fetch. Lo usa EnviarContacto, que valida y envía. Campos en el orden del
 * diseño: pieza, foto, teléfono, nombre, zona, daño, mensaje, privacidad; error junto a cada campo; un único
 * Button primario («Enviar petición», #enviar-peticion). En `ok` muestra la confirmación en lugar del formulario;
 * en `limite` y `error` el aviso con Llamar y WhatsApp, y el formulario sigue con lo escrito.
 * Composición registrada en docs/astryx-componentes.md (inputs nativos ocultos con clase de globals.css).
 */
export function FormularioContacto({
  valores,
  errores,
  estado,
  config,
  contacto,
  paginaOrigen = '',
  onCambio,
  onFoto,
  onEnviar,
}: FormularioContactoProps) {
  if (estado === 'ok') {
    return (
      <Aviso status="success" titulo={`Recibido. ${contacto.plazoRespuesta}.`}>
        <VStack gap={3}>
          <Text as="p">¿Quieres adelantar la foto? Mándala por WhatsApp</Text>
          {contacto.whatsapp ? (
            <HStack>
              <BotonWhatsApp
                numero={contacto.whatsapp}
                mensaje={contacto.mensajeWhatsApp}
                etiqueta="Manda la foto por WhatsApp"
                variante="secondary"
              />
            </HStack>
          ) : null}
        </VStack>
      </Aviso>
    );
  }

  const enviando = estado === 'enviando';
  return (
    <VStack
      as="form"
      gap={5}
      // VStackProps no declara los atributos de <form>: sin validación nativa, los errores son los de lib/contacto.ts.
      {...({ noValidate: true } as object)}
      aria-label="Formulario de contacto"
      onSubmit={(e: { preventDefault: () => void }) => {
        e.preventDefault();
        if (!enviando) onEnviar();
      }}
    >
      <Field label="¿Qué quieres reparar?" inputID="pieza" isGroupLabel status={error(errores.pieza)} statusVariant="detached">
        <SegmentedControl label="¿Qué quieres reparar?" value={valores.pieza} onChange={(v) => onCambio('pieza', v)} isDisabled={enviando}>
          {PIEZAS.map((p) => (
            <SegmentedControlItem
              key={p}
              value={p}
              label={NOMBRE_PIEZA[p].label}
              icon={
                <span className="campo-pieza-icono">
                  <IconoServicio tipo={NOMBRE_PIEZA[p].icono} decorative />
                </span>
              }
            />
          ))}
        </SegmentedControl>
      </Field>

      <CampoFoto
        nombre={valores.fotoNombre}
        ayuda={`Con una foto del daño te decimos si tiene arreglo. Máximo ${config.foto_max_mb} MB.`}
        error={errores.foto}
        isDisabled={enviando}
        onFoto={onFoto}
      />

      <TextInput
        label="Teléfono"
        htmlName="telefono"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        description="Te llamamos o escribimos a este número"
        isRequired
        value={valores.telefono}
        onChange={(v) => onCambio('telefono', v)}
        status={error(errores.telefono)}
        isDisabled={enviando}
      />
      <TextInput
        label="Nombre"
        htmlName="nombre"
        autoComplete="name"
        isRequired
        value={valores.nombre}
        onChange={(v) => onCambio('nombre', v)}
        status={error(errores.nombre)}
        isDisabled={enviando}
      />
      <TextInput
        label="Zona o barrio"
        htmlName="zona"
        isOptional
        value={valores.zona}
        onChange={(v) => onCambio('zona', v)}
        status={error(errores.zona)}
        isDisabled={enviando}
      />
      <Selector
        label="Daño"
        htmlName="dano"
        isOptional
        placeholder="Elige el daño"
        options={DANOS}
        value={valores.dano || null}
        hasClear
        onChange={(v: string | null) => onCambio('dano', v ?? '')}
        status={error(errores.dano)}
        isDisabled={enviando}
      />
      <TextArea
        label="Mensaje"
        htmlName="mensaje"
        isOptional
        rows={4}
        value={valores.mensaje}
        onChange={(v) => onCambio('mensaje', v)}
        status={error(errores.mensaje)}
      />

      <VStack gap={1}>
        <CheckboxInput
          label="He leído y acepto la política de privacidad"
          htmlName="privacidad"
          isRequired
          value={valores.privacidad}
          onChange={(v) => onCambio('privacidad', v)}
          status={errores.privacidad ? { type: 'error', message: errores.privacidad } : undefined}
          isDisabled={enviando}
        />
        <Text type="supporting" as="p">
          <Link href="/privacidad/">Lee la política de privacidad</Link>
        </Text>
      </VStack>

      <input
        type="text"
        name="web"
        className="campo-trampa"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        value={valores.web}
        onChange={(e) => onCambio('web', e.currentTarget.value)}
      />
      <input type="hidden" name="pagina_origen" value={paginaOrigen} />

      {estado === 'limite' ? (
        <Aviso status="warning" titulo="Has enviado varias peticiones; llámanos o escríbenos por WhatsApp">
          <Vias contacto={contacto} />
        </Aviso>
      ) : null}
      {estado === 'error' ? (
        <Aviso status="error" titulo="No hemos podido enviar tu petición. No has perdido nada: llámanos o mándanos la foto por WhatsApp.">
          <Vias contacto={contacto} />
        </Aviso>
      ) : null}

      <VStack gap={2}>
        <Text type="supporting" as="p">
          {`Guardamos tu foto ${config.retencion_dias} días`}
        </Text>
        <HStack>
          <Button
            variant="primary"
            size="lg"
            type="submit"
            id="enviar-peticion"
            label={enviando ? 'Enviando…' : 'Enviar petición'}
            isDisabled={enviando}
          />
        </HStack>
      </VStack>
    </VStack>
  );
}
