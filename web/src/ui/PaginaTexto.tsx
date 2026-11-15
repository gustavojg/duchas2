import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/VStack';
import type { ReactNode } from 'react';

export interface PaginaTextoProps {
  /** Único H1 de la página. */
  titulo: string;
  children: ReactNode;
}

/**
 * Página de texto largo (legales, Quiénes somos): columna de lectura con `--measure` y margen lateral (clase
 * `texto-largo` de globals.css, solo var(--…)), H1 y los apartados que recibe (Heading 2 + Text). Composición
 * registrada en docs/astryx-componentes.md.
 */
export function PaginaTexto({ titulo, children }: PaginaTextoProps) {
  return (
    <VStack gap={5} className="texto-largo">
      <Heading level={1}>{titulo}</Heading>
      {children}
    </VStack>
  );
}
