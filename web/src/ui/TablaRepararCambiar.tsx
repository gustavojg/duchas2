import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import type { FilaVisible } from '../lib/catalogo';

export interface TablaRepararCambiarProps {
  /** Filas ya filtradas por filasComparativa(): solo las publicables. */
  filas: FilaVisible[];
  /** De dónde sale la cifra de cambiar (comparativa.json). */
  fuente: string;
  /** Si la fila de coste está entre las filas: solo entonces se cita la fuente. */
  conCoste: boolean;
}

/**
 * «¿Reparar o cambiar?» (brain/design.md § Portada, 4): Table de Astryx con 3 columnas como máximo (concepto,
 * Reparar, Cambiar); el texto envuelve (sin scroll horizontal). La cabecera «Reparar» lleva la cinta (clase
 * `tabla-cabecera-reparar` de globals.css) y las cifras del coste van en mono. Composición registrada en
 * docs/astryx-componentes.md. Table pinta su propio estilo en línea de overflow en el contenedor de scroll.
 */
export function TablaRepararCambiar({ filas, fuente, conCoste }: TablaRepararCambiarProps) {
  return (
    <VStack gap={2}>
      <Table dividers="rows" verticalAlign="top">
        <TableHeader>
          <TableRow>
            <TableHeaderCell>{''}</TableHeaderCell>
            <TableHeaderCell className="tabla-cabecera-reparar">Reparar</TableHeaderCell>
            <TableHeaderCell>Cambiar</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filas.map((f) => (
            <TableRow key={f.id}>
              <TableCell>
                <Text weight="semibold">{f.etiqueta}</Text>
              </TableCell>
              <TableCell>
                <Text type={f.id === 'coste' ? 'code' : 'body'}>{f.reparar}</Text>
              </TableCell>
              <TableCell>
                <Text type={f.id === 'coste' ? 'code' : 'body'}>{f.cambiar}</Text>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {conCoste ? (
        <Text as="p" type="supporting">
          {fuente}
        </Text>
      ) : null}
    </VStack>
  );
}
