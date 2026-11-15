import { AspectRatio } from '@astryxdesign/core/AspectRatio';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { ParGaleria } from '../lib/content';
import { PlatoPartido } from './art';
import { CintaEtiqueta } from './CintaEtiqueta';

export interface HuecoFotoProps {
  par: ParGaleria;
  lado: 'antes' | 'despues';
  /** Solo la cinta y la ilustración, sin el aviso ni el texto del hueco (miniaturas, deslizador). */
  compacta?: boolean;
}

/**
 * Foto de un lado de un par antes/después (docs/astryx-componentes.md, fila «imagen»): `<img>` nativo dentro de
 * AspectRatio 4:3. Mientras el cliente no mande la foto (`par[lado]` null), la ilustración de art.tsx en su
 * lugar, con la cinta «ILUSTRACIÓN», el aviso y el texto del hueco, para no hacerla pasar por una foto real.
 */
export function HuecoFoto({ par, lado, compacta = false }: HuecoFotoProps) {
  const foto = par[lado];
  const alt = lado === 'antes' ? par.alt_antes : par.alt_despues;
  if (foto) {
    return (
      <AspectRatio ratio={4 / 3} fit="cover">
        <img src={foto} alt={alt} loading="lazy" />
      </AspectRatio>
    );
  }
  return (
    <VStack gap={2}>
      <CintaEtiqueta>Ilustración</CintaEtiqueta>
      {compacta ? null : <Text as="p">Pronto, fotos reales de este trabajo</Text>}
      {!compacta && par.hueco ? (
        <Text as="p" type="supporting">
          {par.hueco}
        </Text>
      ) : null}
      <AspectRatio ratio={4 / 3} fit="contain">
        <PlatoPartido title={alt} />
      </AspectRatio>
    </VStack>
  );
}
