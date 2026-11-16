import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { ConfigFormulario } from '../lib/config';
import type { Negocio } from '../lib/content';
import { type Modo, texto } from '../lib/dato';
import { rutaDeServicio } from '../lib/rutas';
import { APP_NAME } from '../lib/site';
import { telLink, waLink } from '../lib/whatsapp';
import type { NavItem } from './Nav';

const MENSAJE_WHATSAPP = 'Hola, os escribo desde la web. Os mando una foto del daño.';

export interface PieSitioProps {
  negocio: Negocio;
  config: ConfigFormulario;
  modo: Modo;
  legales: NavItem[];
  servicios: { slug: string; nombre: string; ruta?: string }[];
}

/**
 * Pie del sitio (brain/design.md § Portada, 12): marca, contacto (el teléfono único de negocio.json, tal cual),
 * horario si está confirmado, servicios, legales y la retención de la foto. Composición registrada en
 * docs/astryx-componentes.md: VStack/HStack + Heading + Text + Link; la columna la da `.pie-sitio` de
 * globals.css (solo tokens).
 */
export function PieSitio({ negocio, config, modo, legales, servicios }: PieSitioProps) {
  const marca = negocio.marca.valor ?? APP_NAME;
  const telefono = negocio.telefono.valor;
  const whatsapp = negocio.whatsapp.valor;
  const horario = texto(negocio.horario, modo);
  return (
    <VStack gap={4} className="pie-sitio">
      <HStack gap={8} wrap="wrap">
        <VStack gap={2}>
          <Heading level={2}>{marca}</Heading>
          {telefono ? (
            <Link href={telLink(telefono)} isStandalone>
              {telefono}
            </Link>
          ) : null}
          {whatsapp ? (
            <Link href={waLink(whatsapp, MENSAJE_WHATSAPP)} isStandalone>
              Escríbenos por WhatsApp
            </Link>
          ) : null}
          {horario ? (
            <Text as="p" type="supporting">{`Horario: ${horario}`}</Text>
          ) : null}
        </VStack>
        {servicios.length > 0 ? (
          <VStack gap={2} as="nav" aria-label="Servicios">
            <Heading level={2}>Servicios</Heading>
            {servicios.map((s) => (
              <Link key={s.slug} href={rutaDeServicio(s)} isStandalone>
                {s.nombre}
              </Link>
            ))}
          </VStack>
        ) : null}
        <VStack gap={2} as="nav" aria-label="Legales">
          {legales.map((l) => (
            <Link key={l.href} href={l.href} isStandalone>
              {l.label}
            </Link>
          ))}
        </VStack>
      </HStack>
      <Text as="p" type="supporting">{`Guardamos tu foto ${config.retencion_dias} días`}</Text>
    </VStack>
  );
}
