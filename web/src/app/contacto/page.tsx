import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Metadata } from 'next';
import { type ConfigFormulario, configFormulario } from '../../lib/config';
import { cargarNegocio, type Negocio } from '../../lib/content';
import { type Modo, modoActual } from '../../lib/dato';
import { APP_NAME } from '../../lib/site';
import { presupuesto, respuesta } from '../../lib/textos';
import { mensajePorRuta, telLink } from '../../lib/whatsapp';
import { BotonLlamar } from '../../ui/BotonLlamar';
import { BotonWhatsApp } from '../../ui/BotonWhatsApp';
import { CintaEtiqueta } from '../../ui/CintaEtiqueta';
import { EnviarContacto } from '../../ui/EnviarContacto';

export const metadata: Metadata = {
  title: `Contacto · ${APP_NAME}`,
  description: 'Mándanos una foto del daño por WhatsApp, llámanos o rellena el formulario y te decimos si tiene arreglo.',
};

export interface ContactoProps {
  negocio: Negocio;
  config: ConfigFormulario;
  modo: Modo;
}

const conPunto = (t: string) => (/[.!?]$/.test(t) ? t : `${t}.`);

/**
 * Contacto `/contacto/` (brain/design.md § Soporte): H1, las tres vías (teléfono, WhatsApp y email, más el
 * horario; cada dato solo si tiene valor), el formulario, «Qué pasa después» y la retención de la foto. El único
 * primario es «Enviar petición»: WhatsApp y Llamar van como secundarios. Plazos de textos.ts, retención de
 * configFormulario(); los tests inyectan su contenido por props.
 */
export function Contacto({ negocio, config, modo }: ContactoProps) {
  const whatsapp = negocio.whatsapp.valor;
  const telefono = negocio.telefono.valor;
  const email = negocio.email.valor;
  const horario = negocio.horario.valor;
  const mensaje = mensajePorRuta('/contacto/');
  const plazo = respuesta(negocio.plazos.respuesta, modo);
  return (
    <VStack gap={6} className="portada">
      <VStack gap={4} as="section" aria-labelledby="contacto-titulo">
        <CintaEtiqueta>Contacto · Madrid</CintaEtiqueta>
        <Heading level={1} id="contacto-titulo">
          Mándanos una foto y te decimos si tiene arreglo
        </Heading>
        <Text type="body" as="p">
          Llámanos, escríbenos por WhatsApp o rellena el formulario.
        </Text>
        <HStack gap={2} wrap="wrap" vAlign="center">
          {telefono ? <BotonLlamar href={telLink(telefono)} etiqueta="Llamar" /> : null}
          {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={mensaje} etiqueta="WhatsApp" variante="secondary" /> : null}
        </HStack>
        {email ? (
          <Text as="p">
            {'Email: '}
            <Link href={`mailto:${email}`}>{email}</Link>
          </Text>
        ) : null}
        {horario ? <Text as="p">{`Horario: ${horario}`}</Text> : null}
      </VStack>

      <VStack gap={4} as="section" aria-labelledby="contacto-formulario">
        <Heading level={2} id="contacto-formulario">
          Cuéntanos qué le pasa
        </Heading>
        <EnviarContacto
          config={{ retencion_dias: config.retencion_dias, foto_max_mb: config.foto_max_mb }}
          whatsapp={whatsapp}
          telefono={telefono}
          plazoRespuesta={plazo}
          mensajeWhatsApp={mensaje}
        />
      </VStack>

      <VStack gap={3} as="section" aria-labelledby="contacto-despues">
        <Heading level={2} id="contacto-despues">
          Qué pasa después
        </Heading>
        <VStack gap={2} as="ol">
          {['Miramos tu foto y te decimos si tiene arreglo.', conPunto(plazo), conPunto(presupuesto(negocio.plazos.presupuesto, modo))].map(
            (frase) => (
              <HStack key={frase} as="li">
                <Text>{frase}</Text>
              </HStack>
            ),
          )}
        </VStack>
        <Text type="supporting" as="p">
          {`Tu foto solo la vemos nosotros y se borra a los ${config.retencion_dias} días.`}
        </Text>
      </VStack>
    </VStack>
  );
}

export default function ContactoPage() {
  return <Contacto negocio={cargarNegocio()} config={configFormulario()} modo={modoActual()} />;
}
