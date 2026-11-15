import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { type ConfigFormulario, configFormulario } from '../../lib/config';
import { cargarNegocio, type Negocio } from '../../lib/content';
import { confirmado, type Modo, modoActual, texto } from '../../lib/dato';
import { metadataPagina } from '../../lib/seo';
import { APP_NAME } from '../../lib/site';
import { PaginaTexto } from '../../ui/PaginaTexto';

export const metadata = metadataPagina({
  ruta: '/privacidad/',
  titulo: 'Privacidad',
  descripcion: 'Qué hacemos con tus datos y tu foto, cuánto tiempo los guardamos y cómo pedir que los borremos.',
  baseUrl: cargarNegocio().url_base,
  nombreSitio: APP_NAME,
});

export interface PrivacidadProps {
  negocio: Negocio;
  config: ConfigFormulario;
  modo: Modo;
}

/**
 * Política de privacidad (RGPD, ADR 0006): responsable, finalidad, base legal, conservación, destinatarios,
 * derechos e IP. La retención sale de config.retencion_dias (único «N días» de la página) y los datos del
 * responsable de negocio.json. Texto base sin asesoramiento jurídico: revisar antes de publicar.
 */
export function Privacidad({ negocio, config, modo }: PrivacidadProps) {
  const dato = (d: Negocio['legal']['nif']) => texto(d, modo, { alternativo: 'por confirmar' });
  const telefono = negocio.telefono.valor;
  const email = confirmado(negocio.email) ? negocio.email.valor : null;
  return (
    <PaginaTexto titulo="Privacidad">
      <Text as="p">Aquí te contamos qué hacemos con los datos y la foto que nos mandas.</Text>
      <VStack gap={2} as="section">
        <Heading level={2}>Quién es el responsable</Heading>
        <Text as="p">{`Responsable: ${dato(negocio.legal.razon_social)}`}</Text>
        <Text as="p">{`NIF: ${dato(negocio.legal.nif)}`}</Text>
        <Text as="p">{`Domicilio: ${dato(negocio.legal.domicilio)}`}</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Para qué usamos tus datos</Heading>
        <Text as="p">Para atender tu petición y responderte.</Text>
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
        <Text as="p">{`Guardamos tus datos y tu foto ${config.retencion_dias} días y después se borran solos.`}</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Quién más los ve</Heading>
        <Text as="p">Nadie fuera de nuestro equipo.</Text>
        <Text as="p">Solo los usa el servicio de correo con el que nos llega tu petición.</Text>
        <Text as="p">No los cedemos a nadie salvo que lo exija la ley.</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Tus derechos y cómo ejercerlos</Heading>
        <Text as="p">Puedes pedirnos ver tus datos, corregirlos, borrarlos o limitar su uso.</Text>
        <Text as="p">También puedes oponerte a que los usemos o pedir que te los pasemos.</Text>
        {telefono ? <Text as="p">{`Pídelo llamando al ${telefono}.`}</Text> : null}
        {email ? <Text as="p">{`O escríbenos a ${email}.`}</Text> : null}
        <Text as="p">Si no te atendemos bien, puedes reclamar ante la Agencia Española de Protección de Datos.</Text>
      </VStack>
      <VStack gap={2} as="section">
        <Heading level={2}>Tu IP</Heading>
        <Text as="p">Para limitar envíos repetidos guardamos tu IP, solo cifrada.</Text>
        <Text as="p">No la usamos para nada más.</Text>
      </VStack>
    </PaginaTexto>
  );
}

export default function Page() {
  return <Privacidad negocio={cargarNegocio()} config={configFormulario()} modo={modoActual()} />;
}
