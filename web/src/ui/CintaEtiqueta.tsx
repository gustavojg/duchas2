import { Text } from '@astryxdesign/core/Text';

/**
 * La firma de Duchas 2 (brain/design.md § Firma): tira de cinta de enmascarar crema con texto mono en
 * mayúsculas. Plana, siempre con texto, nunca botón. Solo en el eyebrow del hero (y en las piezas que dice
 * design.md). Composición registrada en docs/astryx-componentes.md: Text (type code) + la clase
 * `cinta-etiqueta` de globals.css, que solo usa var(--color-tape) / var(--color-on-tape) y espaciados del tema.
 */
export function CintaEtiqueta({ children }: { children: string }) {
  return (
    <Text as="p" type="code" weight="bold" color="inherit" className="cinta-etiqueta">
      {children.toUpperCase()}
    </Text>
  );
}
