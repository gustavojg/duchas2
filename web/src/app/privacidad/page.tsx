import { Heading } from '@astryxdesign/core/Heading';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { type ConfigFormulario, configFormulario } from '../../lib/config';
import { cargarNegocio, type Negocio } from '../../lib/content';
import { confirmado, type Modo, modoActual, texto } from '../../lib/dato';
import { metadataPagina } from '../../lib/seo';
import { APP_NAME } from '../../lib/site';
import { telLink } from '../../lib/whatsapp';
import { PaginaTexto } from '../../ui/PaginaTexto';

const TITULO = 'Política de privacidad';

/** title «Política de privacidad · marca», description, canonical (url_base + /privacidad/) y Open Graph. */
export function generateMetadata() {
  return metadataPagina({
    ruta: '/privacidad/',
    titulo: TITULO,
    descripcion:
      'Qué datos recogemos cuando nos escribes, para qué los usamos, cuánto los guardamos y cómo pedir que los borremos.',
    baseUrl: cargarNegocio().url_base,
    nombreSitio: APP_NAME,
  });
}

export interface PrivacidadProps {
  negocio: Negocio;
  /** Solo se usa `retencion_dias` (configFormulario(), ADR 0006). */
  config: Pick<ConfigFormulario, 'retencion_dias'>;
  modo: Modo;
}

/**
 * Política de privacidad `/privacidad/` (RGPD, ADR 0006), enlazada desde la casilla del formulario: responsable,
 * qué datos recoge el formulario, finalidad, base legal, quién ve la foto, conservación, destinatarios, derechos
 * e IP (solo como HMAC). La retención sale de config.retencion_dias (único «N días» de la página). Del
 * responsable, razón social y domicilio dicen «por confirmar» hasta confirmarlos; el NIF no se muestra hasta
 * entonces. Texto base sin asesoramiento jurídico: revisar antes de publicar.
 */
export function Privacidad({ negocio, config, modo }: PrivacidadProps) {
  const dato = (d: Negocio['legal']['nif']) => texto(d, modo, { alternativo: 'por confirmar' });
  const telefono = negocio.telefono.valor;
  const email = confirmado(negocio.email) ? negocio.email.valor : null;
  return (
    <PaginaTexto titulo={TITULO}>
      <Text as="p">Aquí te contamos qué hacemos con los datos y la foto que nos mandas.</Text>
      <VStack gap={2} as="section">
        <Heading level={2}>Quién es el responsable</Heading>
        <Text as="p">{`Responsable: ${dato(negocio.legal.razon_social)}`}</Text>
        {confirmado(negocio.legal.nif) ? <Text as="p">{`NIF: ${dato(negocio.legal.nif)}`}</Text> : null}
        <Text as="p">{`Domicilio: ${dato(negocio.legal.domicilio)}`}</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Qué datos recogemos</Heading>
        <Text as="p">
          Cuando nos escribes con el formulario nos dejas tu teléfono, tu nombre, tu zona, tu mensaje y, si quieres, una
          foto del daño.
        </Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Para qué usamos tus datos</Heading>
        <Text as="p">Para atender tu petición, responderte y darte presupuesto.</Text>
        <Text as="p">Con la foto valoramos el daño y te decimos si tiene arreglo.</Text>
        <Text as="p">No usamos tus datos para publicidad ni los vendemos.</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Por qué podemos usarlos</Heading>
        <Text as="p">Porque nos das tu consentimiento al marcar la casilla de privacidad del formulario.</Text>
        <Text as="p">Puedes retirarlo cuando quieras.</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Cuánto tiempo los guardamos</Heading>
        <Text as="p">{`Guardamos tu petición y tu foto ${config.retencion_dias} días y después se borran solos.`}</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Quién más los ve</Heading>
        <Text as="p">Tu foto solo la vemos nosotros. No se publica ni se comparte con nadie.</Text>
        <Text as="p">Solo los usa el servicio de correo con el que nos llega tu petición.</Text>
        <Text as="p">No los cedemos a nadie salvo que lo exija la ley.</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Tus derechos y cómo ejercerlos</Heading>
        <Text as="p">Puedes pedirnos ver tus datos, corregirlos, borrarlos o limitar su uso.</Text>
        <Text as="p">También puedes oponerte a que los usemos o pedir que te los pasemos.</Text>
        {telefono ? (
          <Text as="p">
            Pídelo llamando al <Link href={telLink(telefono)}>{telefono}</Link>.
          </Text>
        ) : null}
        {email ? <Text as="p">{`O escríbenos a ${email}.`}</Text> : null}
        <Text as="p">Si no te atendemos bien, puedes reclamar ante la Agencia Española de Protección de Datos.</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Tu IP</Heading>
        <Text as="p">
          Para evitar envíos abusivos guardamos tu IP solo cifrada, como una huella irreversible (HMAC), nunca la
          dirección en claro.
        </Text>
        <Text as="p">No la usamos para nada más.</Text>
      </VStack>
    </PaginaTexto>
  );
}

export interface PaginaPrivacidadProps {
  negocio: Negocio;
  /** Días que se guardan la petición y la foto (configFormulario(), ADR 0006). */
  retencion_dias: number;
  modo?: Modo;
}

/** La misma página con la retención como número suelto. */
export function PaginaPrivacidad({ negocio, retencion_dias, modo = 'publico' }: PaginaPrivacidadProps) {
  return <Privacidad negocio={negocio} config={{ retencion_dias }} modo={modo} />;
}

export default function Page() {
  return <Privacidad negocio={cargarNegocio()} config={configFormulario()} modo={modoActual()} />;
}
