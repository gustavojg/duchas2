import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// vitest corre desde web/: el documento D0 está en la raíz del repo.
const DOC = join(process.cwd(), '..', 'docs', 'astryx-componentes.md');

/** Piezas del PRD (D0) más migas de pan y segmented control (brain/design.md). */
const PIEZAS = [
  'botón',
  'enlace',
  'tarjeta',
  'titular/texto',
  'layout/stack',
  'acordeón',
  'deslizador antes/después',
  'campo de texto',
  'select',
  'casilla',
  'adjuntar archivo',
  'textarea',
  'error de campo',
  'banner',
  'imagen',
  'migas de pan',
  'segmented control',
];

const PREFIJOS = ['componente Astryx:', 'composición con primitivas:'];

/** Filas de la tabla de piezas: celdas de cada línea `| pieza | resolución | … |`. */
function filas(md: string): string[][] {
  return md
    .split('\n')
    .filter((l) => l.trim().startsWith('|'))
    .map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
}

describe('docs/astryx-componentes.md (D0)', () => {
  it('existe y fija la versión 0.7.16 de los tres paquetes', () => {
    expect(existsSync(DOC)).toBe(true);
    const md = readFileSync(DOC, 'utf8');
    expect(md).toContain('0.7.16');
    for (const p of ['@astryxdesign/core', '@astryxdesign/theme-neutral', '@astryxdesign/cli']) expect(md).toContain(p);
  });

  it('tiene una fila por pieza y cada una está resuelta con componente o composición', () => {
    const md = readFileSync(DOC, 'utf8');
    const tabla = filas(md);
    for (const pieza of PIEZAS) {
      const fila = tabla.find((f) => f[0]?.toLowerCase() === pieza);
      expect(fila, `falta la fila de «${pieza}»`).toBeDefined();
      const resolucion = fila![1] ?? '';
      expect(
        PREFIJOS.some((p) => resolucion.startsWith(p)),
        `«${pieza}» no empieza por ${PREFIJOS.join(' o ')}: ${resolucion}`,
      ).toBe(true);
    }
  });

  it('no deja piezas sin resolver y registra las composiciones', () => {
    const md = readFileSync(DOC, 'utf8');
    expect(md).not.toMatch(/sin resolver:/i);
    expect(md).toContain('## Composiciones registradas');
    for (const c of ['CintaEtiqueta', 'BotonWhatsApp', 'FranjaConfianza']) expect(md).toContain(c);
  });

  it('registra con su fila las composiciones de las páginas de servicio, Hoteles y galería', () => {
    const tabla = filas(readFileSync(DOC, 'utf8'));
    for (const c of ['PlantillaServicio', 'PasosServicio', 'GaleriaFiltrable']) {
      const fila = tabla.find((f) => f[0] === c);
      expect(fila, `falta la fila de ${c}`).toBeDefined();
      expect(fila![1], `${c}: falta el fichero`).toMatch(/web\/src\/ui\/\w+\.tsx/);
      expect(fila![2]?.length ?? 0, `${c}: faltan los componentes Astryx`).toBeGreaterThan(0);
    }
    const pasos = tabla.find((f) => f[0] === 'PasosServicio')!.join(' ');
    expect(pasos).toContain('/hoteles-y-comunidades/');
  });

  it('la nota de GaleriaFiltrable describe el filtro que salta de línea, no uno que recorta etiquetas', () => {
    const galeria = filas(readFileSync(DOC, 'utf8'))
      .find((f) => f[0] === 'GaleriaFiltrable')!
      .join(' ');
    expect(galeria).not.toMatch(/recorta/i);
    expect(galeria).toContain('filtro-galeria');
  });
});
