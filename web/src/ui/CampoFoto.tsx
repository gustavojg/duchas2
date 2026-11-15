'use client';

import { Button } from '@astryxdesign/core/Button';
import { Field } from '@astryxdesign/core/Field';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { useRef } from 'react';

/** Tipos de foto que admite el servidor (src/domain/foto.ts los comprueba por bytes). HEIC también por extensión. */
export const ACCEPT_FOTO = 'image/jpeg,image/png,image/webp,image/heic,.heic';

export interface CampoFotoProps {
  /** Nombre del archivo elegido; vacío si no hay foto. */
  nombre: string;
  /** Ayuda bajo la etiqueta (con el máximo de foto_max_mb). */
  ayuda: string;
  /** Error junto al campo (tamaño o tipo). */
  error?: string;
  isDisabled?: boolean;
  /** Archivo elegido, o null al quitarlo. */
  onFoto: (archivo: File | null) => void;
}

/**
 * Campo de foto del formulario (brain/design.md § Formulario): botón «Añadir foto del daño» que abre el selector
 * del móvil (cámara o galería: sin atributo `capture`), nombre del archivo elegido y botón para quitarlo.
 * Composición registrada en docs/astryx-componentes.md: Field (etiqueta, ayuda y error junto al campo) + Button +
 * Text sobre un `<input type="file">` nativo oculto con la clase `campo-foto-input` de globals.css. No usa
 * FileInput de Astryx porque descarta en silencio los tipos fuera de `accept` (sin avisar a quien lo usa) y aquí
 * el aviso de tipo y de tamaño tiene que ser el texto de lib/contacto.ts.
 */
export function CampoFoto({ nombre, ayuda, error, isDisabled, onFoto }: CampoFotoProps) {
  const input = useRef<HTMLInputElement>(null);
  const quitar = () => {
    if (input.current) input.current.value = '';
    onFoto(null);
  };
  return (
    <Field
      label="Foto del daño"
      inputID="foto"
      description={ayuda}
      isOptional
      status={error ? { type: 'error', message: error, messageID: 'foto-estado' } : undefined}
      statusVariant="detached"
    >
      <VStack gap={2}>
        <input
          ref={input}
          id="foto"
          name="foto"
          type="file"
          accept={ACCEPT_FOTO}
          className="campo-foto-input"
          tabIndex={-1}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'foto-estado' : undefined}
          disabled={isDisabled}
          onChange={(e) => onFoto(e.currentTarget.files?.[0] ?? null)}
        />
        <HStack gap={2} wrap="wrap" vAlign="center">
          <Button
            variant="secondary"
            size="lg"
            label={nombre ? 'Cambiar foto' : 'Añadir foto del daño'}
            isDisabled={isDisabled}
            onClick={() => input.current?.click()}
          />
          {nombre ? (
            <>
              <Text type="supporting">{nombre}</Text>
              <Button variant="ghost" size="lg" label="Quitar foto" isDisabled={isDisabled} onClick={quitar} />
            </>
          ) : null}
        </HStack>
      </VStack>
    </Field>
  );
}
