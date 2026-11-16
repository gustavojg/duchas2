import { AspectRatio } from '@astryxdesign/core/AspectRatio';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { ParGaleria } from '../lib/content';
import { type Dano, IlustracionDano, PlatoPartido } from './art';
import { CintaEtiqueta } from './CintaEtiqueta';

export interface HuecoFotoProps {
  par: ParGaleria;
  lado: 'antes' | 'despues';
  /**
   * Solo la ilustración, sin cintas (ni «ILUSTRACIÓN» ni la vertical «ANTES · DESPUÉS»), sin el aviso ni el texto
   * del hueco: miniaturas, donde quien la usa pone una única cinta «ILUSTRACIONES» para todas.
   */
  compacta?: boolean;
  /** Solo con `compacta` y sin foto: la ilustración de ese daño en lugar del plato partido, para variar las miniaturas. */
  dano?: Dano;
}

/**
 * Foto de un lado de un par antes/después (docs/astryx-componentes.md, fila «imagen»): `<img>` nativo dentro de
 * AspectRatio 4:3. Mientras el cliente no mande la foto (`par[lado]` null), la ilustración de art.tsx en su
 * lugar, con la cinta «ILUSTRACIÓN», el aviso y el texto del hueco, para no hacerla pasar por una foto real.
 */
export function HuecoFoto({ par, lado, compacta = false, dano }: HuecoFotoProps) {
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
      {compacta ? null : <CintaEtiqueta>Ilustración</CintaEtiqueta>}
      {compacta ? null : <Text as="p">Pronto, fotos reales de este trabajo</Text>}
      {!compacta && par.hueco ? (
        <Text as="p" type="supporting">
          {par.hueco}
        </Text>
      ) : null}
      <AspectRatio ratio={4 / 3} fit="contain">
        {compacta && dano ? <IlustracionDano dano={dano} title={alt} /> : <PlatoPartido title={alt} sinCinta={compacta} />}
      </AspectRatio>
    </VStack>
  );
}
