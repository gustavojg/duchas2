import { HStack } from '@astryxdesign/core/HStack';
import { Section } from '@astryxdesign/core/Section';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { type Compromiso, IconoCompromiso } from './art';

export interface CompromisoFranja {
  tipo: Compromiso;
  /** Texto ya resuelto por textos.ts (p. ej. garantia()); vacío ⇒ el compromiso no aparece. */
  texto: string;
}

export interface FranjaConfianzaProps {
  compromisos: CompromisoFranja[];
}

/**
 * Franja de confianza (brain/design.md § Portada, 2): compromisos verificables con icono propio (garantía, sin
 * obras, hoteles y años), sin cifras sin confirmar. No escribe textos ni cifras: los recibe ya resueltos de
 * textos.compromisosFranja(); los de texto vacío no aparecen. Composición registrada
 * en docs/astryx-componentes.md: Section + VStack/HStack + Text + IconoCompromiso; el hueco del icono usa la
 * clase `franja-confianza-icono` de globals.css (solo var(--…)).
 */
export function FranjaConfianza({ compromisos }: FranjaConfianzaProps) {
  const visibles = compromisos.filter((c) => c.texto.trim() !== '');
  return (
    <Section variant="muted" padding={4}>
      <VStack gap={3} as="ul" aria-label="Nuestros compromisos">
        {visibles.map((c) => (
          <HStack key={c.tipo} gap={3} vAlign="center" as="li">
            <span className="franja-confianza-icono">
              <IconoCompromiso tipo={c.tipo} decorative />
            </span>
            <Text weight="semibold">{c.texto}</Text>
          </HStack>
        ))}
      </VStack>
    </Section>
  );
}
