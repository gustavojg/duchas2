import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { Metadata } from 'next';
import { cargarGaleria, cargarNegocio, type Negocio, type ParGaleria } from '../../lib/content';
import { APP_NAME } from '../../lib/site';
import { MENSAJE_PORTADA } from '../../lib/whatsapp';
import { BotonWhatsApp } from '../../ui/BotonWhatsApp';
import { HuecoFoto } from '../../ui/HuecoFoto';

export const metadata: Metadata = {
  title: `Antes y después · ${APP_NAME}`,
  description: 'Trabajos reales de reparación de platos de ducha, bañeras y azulejos, antes y después.',
};

export interface AntesYDespuesProps {
  galeria: ParGaleria[];
  negocio: Negocio;
}

/**
 * Antes y después `/antes-y-despues/` (enlace «Ver todos los trabajos» de la portada). Página mínima, sin filtros:
 * solo los pares de galeria.json con las dos fotos reales, cada lado con HuecoFoto. Si aún no hay ninguno, el
 * mismo aviso que la portada y «Manda la foto del tuyo» por WhatsApp (si hay número); nunca ilustraciones que
 * parezcan trabajos.
 */
export function AntesYDespues({ galeria, negocio }: AntesYDespuesProps) {
  const conFotos = galeria.filter((par) => par.antes && par.despues);
  const whatsapp = negocio.whatsapp.valor;
  return (
    <VStack gap={6} className="portada">
      <Heading level={1}>Antes y después</Heading>
      {conFotos.length > 0 ? (
        <VStack gap={6} as="ul" aria-label="Trabajos">
          {conFotos.map((par) => (
            <HStack as="li" gap={3} wrap="wrap" key={`${par.antes}|${par.despues}`}>
              <HuecoFoto par={par} lado="antes" />
              <HuecoFoto par={par} lado="despues" />
            </HStack>
          ))}
        </VStack>
      ) : (
        <Text as="p">Pronto, fotos reales de este trabajo</Text>
      )}
      {whatsapp ? <BotonWhatsApp numero={whatsapp} mensaje={MENSAJE_PORTADA} etiqueta="Manda la foto del tuyo" /> : null}
    </VStack>
  );
}

export default function PaginaAntesYDespues() {
  return <AntesYDespues galeria={cargarGaleria()} negocio={cargarNegocio()} />;
}
