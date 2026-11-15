/**
 * Qué rutas genera el build: se deduce de los page.tsx reales de web/src/app, no de una lista a mano.
 * Un segmento dinámico `[x]` casa con cualquier segmento de la ruta y los grupos `(g)` no cuentan como
 * segmento. Solo node:fs y node:path; sin React ni Next.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** web/src/app desde el cwd (web/ o la raíz del repo), igual que contentDir(). */
export function appDir(): string {
  const cwd = process.cwd();
  for (const dir of [join(cwd, 'src', 'app'), join(cwd, 'web', 'src', 'app')]) {
    if (existsSync(join(dir, 'layout.tsx')) || existsSync(join(dir, 'page.tsx'))) return dir;
  }
  throw new Error(`No se encuentra web/src/app desde ${cwd}`);
}

/** Segmentos de una ruta, sin query ni hash: '/a/b/?q#h' -> ['a', 'b']. */
const segmentos = (ruta: string) =>
  ruta
    .split(/[?#]/)[0]
    .split('/')
    .filter(Boolean);

const subdirs = (dir: string) =>
  readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

const esGrupo = (n: string) => /^\(.+\)$/.test(n);
const esDinamico = (n: string) => /^\[[^\]]+\]$/.test(n);

function casa(dir: string, resto: string[]): boolean {
  if (resto.length === 0 && existsSync(join(dir, 'page.tsx'))) return true;
  for (const n of subdirs(dir)) {
    if (esGrupo(n)) {
      if (casa(join(dir, n), resto)) return true;
    } else if (resto.length > 0 && (n === resto[0] || esDinamico(n))) {
      if (casa(join(dir, n), resto.slice(1))) return true;
    }
  }
  return false;
}

/** ¿El build genera una página para `ruta`? ('/zonas/' -> existe app/zonas/page.tsx). */
export function rutaGenerada(ruta: string, dir: string = appDir()): boolean {
  return casa(dir, segmentos(ruta));
}
