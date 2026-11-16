import { Heading } from '@astryxdesign/core/Heading';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Metadata } from 'next';
import { configFormulario } from '../../lib/config';
import { cargarNegocio, type Negocio } from '../../lib/content';
import { APP_NAME } from '../../lib/site';
import { telLink } from '../../lib/whatsapp';

export const metadata: Metadata = {
  title: `Política de privacidad · ${APP_NAME}`,
  description: 'Qué datos recogemos cuando nos escribes, para qué los usamos y cuándo los borramos.',
};

export interface PaginaPrivacidadProps {
  negocio: Negocio;
  /** Días que se guardan la petición y la foto (configFormulario(), ADR 0006). */
  retencion_dias: number;
}

/**
 * Política de privacidad `/privacidad/`, enlazada desde la casilla del formulario. Contenido mínimo: qué datos
 * recoge el formulario, quién ve la foto, cuánto se guardan (retencion_dias, una sola fuente) y que la IP solo
 * se guarda como HMAC. Los datos legales del responsable (razón social, NIF, domicilio) no se muestran hasta
 * que el cliente los confirme; el teléfono, si negocio.json lo tiene, como vía de contacto.
 */
export function PaginaPrivacidad({ negocio, retencion_dias }: PaginaPrivacidadProps) {
  const telefono = negocio.telefono.valor;
  return (
    <VStack gap={6} className="portada">
      <Heading level={1}>Política de privacidad</Heading>
      <VStack gap={3} as="section" aria-labelledby="privacidad-datos">
        <Heading level={2} id="privacidad-datos">
          Qué datos recogemos
        </Heading>
        <Text as="p">
          Cuando nos escribes con el formulario nos dejas tu teléfono, tu nombre, tu zona, tu mensaje y, si quieres, una
          foto del daño. Solo los usamos para responderte y darte presupuesto.
        </Text>
      </VStack>
      <VStack gap={3} as="section" aria-labelledby="privacidad-foto">
        <Heading level={2} id="privacidad-foto">
          Tu foto
        </Heading>
        <Text as="p">Tu foto solo la vemos nosotros. No se publica ni se comparte con nadie.</Text>
      </VStack>
      <VStack gap={3} as="section" aria-labelledby="privacidad-plazo">
        <Heading level={2} id="privacidad-plazo">
          Cuánto tiempo los guardamos
        </Heading>
        <Text as="p">{`Borramos tu petición y tu foto a los ${retencion_dias} días.`}</Text>
        <Text as="p">
          Para evitar envíos abusivos guardamos tu IP solo como una huella irreversible (HMAC), nunca la dirección en claro.
        </Text>
      </VStack>
      {telefono ? (
        <VStack gap={3} as="section" aria-labelledby="privacidad-contacto">
          <Heading level={2} id="privacidad-contacto">
            Tus datos, cuando quieras
          </Heading>
          <Text as="p">Si quieres ver, corregir o borrar tus datos antes de ese plazo, llámanos:</Text>
          <Link href={telLink(telefono)}>{telefono}</Link>
        </VStack>
      ) : null}
    </VStack>
  );
}

export default function Privacidad() {
  return <PaginaPrivacidad negocio={cargarNegocio()} retencion_dias={configFormulario().retencion_dias} />;
}
