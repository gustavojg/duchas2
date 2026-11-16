import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Build de fixture en web/out-fixture: el contenido de web/content con un negocio.json completo (sin modo
 * borrador, teléfono y WhatsApp confirmados con el mismo número, y ga4_id). Lo usan tests/build/fixture.test.ts y
 * el webServer de :3101 de playwright.config.ts (`tsx tests/build/construir-fixture.ts`). web/out no se toca:
 * NEXT_DIST_DIR=out-fixture hace que el export de Next vaya a web/out-fixture (web/next.config.ts).
 * Solo se cambian valores existentes: negocio.json tiene esquema strict y un campo de más rompe el build.
 */
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DIST = 'out-fixture';
export const DIR_FIXTURE = path.join(RAIZ, 'web', DIST);

const confirmado = <T>(valor: T) => ({ valor, confirmado: true });
const TELEFONO = '+34 611 222 333';

function negocioCompleto(negocio: Record<string, any>): Record<string, any> {
  negocio.legal.razon_social = confirmado('Reformas Fixture S.L.');
  negocio.legal.nif = confirmado('B12345678');
  negocio.legal.domicilio = confirmado('Calle Prueba 1, 28001 Madrid');
  negocio.telefono = confirmado(TELEFONO);
  negocio.whatsapp = confirmado(TELEFONO);
  negocio.garantia.anios = confirmado(2);
  negocio.analitica.ga4_id = 'G-TEST123456';
  return negocio;
}

function ejecutar(args: string[], env: Record<string, string>): string {
  const { NODE_ENV: _, ...base } = process.env; // vitest pone NODE_ENV=test; next build pone el suyo
  const r = spawnSync('pnpm', args, { cwd: RAIZ, env: { ...base, ...env }, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const salida = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  if (r.status !== 0) throw new Error(`pnpm ${args.join(' ')} falló (${r.status ?? r.error?.message}):\n${salida}`);
  return salida;
}

export function construirFixtureConSalida(): { dir: string; salidaPostbuild: string } {
  fs.rmSync(DIR_FIXTURE, { recursive: true, force: true });
  const contenido = fs.mkdtempSync(path.join(os.tmpdir(), 'duchas-fixture-'));
  try {
    fs.cpSync(path.join(RAIZ, 'web', 'content'), contenido, { recursive: true });
    const fichero = path.join(contenido, 'negocio.json');
    const negocio = negocioCompleto(JSON.parse(fs.readFileSync(fichero, 'utf8')));
    fs.writeFileSync(fichero, `${JSON.stringify(negocio, null, 2)}\n`);

    ejecutar(['--filter', 'web', 'build'], { CONTENT_DIR: contenido, NEXT_DIST_DIR: DIST });
    if (!fs.existsSync(path.join(DIR_FIXTURE, 'index.html'))) throw new Error(`el build no ha generado ${DIR_FIXTURE}/index.html`);
    const salidaPostbuild = ejecutar(['exec', 'tsx', 'scripts/postbuild.ts'], { CONTENT_DIR: contenido, WEB_DIR: DIR_FIXTURE });
    return { dir: DIR_FIXTURE, salidaPostbuild };
  } finally {
    fs.rmSync(contenido, { recursive: true, force: true });
  }
}

export function construirFixture(): string {
  return construirFixtureConSalida().dir;
}

// Como script (webServer de Playwright): construye sin imprimir nada; si falla, el error sale por stderr.
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  construirFixture();
}
