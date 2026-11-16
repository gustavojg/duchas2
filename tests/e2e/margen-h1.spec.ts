import { expect, type Page, test } from '@playwright/test';

/**
 * `pnpm e2e`: a 360 px, el H1 no queda bajo la cabecera fija (TopNav del AppShell, el primer `header`) y el bloque
 * que abre con él arranca a la misma distancia de la cabecera en /antes-y-despues/ y /privacidad/ que en /zonas/ y
 * /contacto/ (la referencia, tolerancia 1 px).
 *
 * «Arranque del bloque del H1»: el primer hijo del elemento que contiene el H1. En /zonas/ es el propio H1; en
 * /contacto/ es la cinta «CONTACTO · MADRID» que lo encabeza (eyebrow), así que medir el H1 a secas daría la altura
 * de la cinta de diferencia aunque el margen superior sea el mismo. En /privacidad/ (PaginaTexto, `.texto-largo`)
 * el H1 es el primer hijo y el relleno superior del contenedor sí cuenta; en /antes-y-despues/ cuenta lo que vaya
 * antes del bloque del H1 (las migas).
 */
const REFERENCIA = ['/zonas/', '/contacto/'] as const;
const IGUALAR = ['/antes-y-despues/', '/privacidad/'] as const;
const RUTAS = [...REFERENCIA, ...IGUALAR];

test.use({ viewport: { width: 360, height: 740 } });

interface Medida {
  h1Top: number;
  cabeceraBottom: number;
  /** Distancia (px) entre el borde inferior de la cabecera y el arranque del bloque del H1. */
  distancia: number;
}

/** Mide con la página arriba del todo. */
async function medir(page: Page, ruta: string): Promise<Medida> {
  await page.goto(ruta);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => window.scrollTo(0, 0));
  const h1 = page.locator('h1').first();
  const h1Box = await h1.boundingBox();
  const cabecera = await page.locator('header').first().boundingBox();
  expect(h1Box, `${ruta}: H1`).not.toBeNull();
  expect(cabecera, `${ruta}: cabecera`).not.toBeNull();
  const arranque = await h1.evaluate((el) => (el.parentElement?.firstElementChild ?? el).getBoundingClientRect().top);
  const cabeceraBottom = cabecera!.y + cabecera!.height;
  return { h1Top: h1Box!.y, cabeceraBottom, distancia: arranque - cabeceraBottom };
}

test.describe('margen superior del H1 a 360 px', () => {
  for (const ruta of RUTAS) {
    test(`${ruta}: el H1 no queda bajo la cabecera fija`, async ({ page }) => {
      const m = await medir(page, ruta);
      expect(m.h1Top, `${ruta}: top del H1 (${m.h1Top}) >= bottom de la cabecera (${m.cabeceraBottom})`).toBeGreaterThanOrEqual(m.cabeceraBottom);
    });
  }

  test('/antes-y-despues/ y /privacidad/ separan el H1 de la cabecera igual que /zonas/ y /contacto/', async ({ page }) => {
    const medidas: Record<string, number> = {};
    for (const ruta of RUTAS) medidas[ruta] = (await medir(page, ruta)).distancia;
    const [zonas, contacto] = REFERENCIA.map((r) => medidas[r]!);
    expect(Math.abs(zonas! - contacto!), `referencia: ${JSON.stringify(medidas)}`).toBeLessThanOrEqual(1);
    for (const ruta of IGUALAR) {
      expect(Math.abs(medidas[ruta]! - zonas!), `${ruta} frente a /zonas/: ${JSON.stringify(medidas)}`).toBeLessThanOrEqual(1);
    }
  });
});
