import { expect, type Page, test } from '@playwright/test';
import { e2eTarget } from '../../src/e2e-target.js';

/**
 * Banner de cookies y GA4 opt-in. Project 'chromium-fixture' de playwright.config.ts: por defecto contra :3101,
 * que sirve web/out-fixture (negocio completo con ga4_id, tests/build/construir-fixture.ts). El último describe
 * vuelve a :3100 (build de ejemplo, sin ga4_id), donde no hay banner.
 */

/** Intercepta Google Tag Manager (sin red real): responde JS vacío y cuenta las peticiones. */
async function contarGa(page: Page) {
  const peticiones: string[] = [];
  await page.route(
    (url) => url.hostname === 'googletagmanager.com' || url.hostname.endsWith('.googletagmanager.com'),
    (route) => {
      peticiones.push(route.request().url());
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    },
  );
  return peticiones;
}

const eleccion = (page: Page) => page.evaluate(() => window.localStorage.getItem('cookies-eleccion'));

test.describe('con ga4_id (build de fixture)', () => {
  test('«Aceptar» y «Rechazar» se ven con el mismo tamaño y GA no se pide hasta aceptar', async ({ page }) => {
    const errores: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
    const ga = await contarGa(page);
    await page.goto('/');

    const aceptar = page.getByRole('button', { name: 'Aceptar' });
    const rechazar = page.getByRole('button', { name: 'Rechazar' });
    await expect(aceptar).toBeVisible();
    await expect(rechazar).toBeVisible();
    const [a, r] = [await aceptar.boundingBox(), await rechazar.boundingBox()];
    expect(a && r, 'sin caja').toBeTruthy();
    expect(Math.abs(a!.width - r!.width)).toBeLessThanOrEqual(1);
    expect(Math.abs(a!.height - r!.height)).toBeLessThanOrEqual(1);
    expect(ga).toHaveLength(0);

    await aceptar.click();
    await expect(aceptar).toHaveCount(0);
    await expect.poll(() => ga.length).toBe(1);
    expect(ga[0]).toContain('id=G-TEST123456');
    expect(await eleccion(page)).toBe('aceptadas');

    await page.reload();
    await expect.poll(() => ga.length).toBe(2);
    await expect(page.getByRole('button', { name: 'Aceptar' })).toHaveCount(0);
    expect(errores).toEqual([]);
  });

  test('«Rechazar» no pide GA ni antes ni después, y al recargar no vuelve el banner', async ({ page }) => {
    const ga = await contarGa(page);
    await page.goto('/');
    const rechazar = page.getByRole('button', { name: 'Rechazar' });
    await expect(rechazar).toBeVisible();
    expect(ga).toHaveLength(0);

    await rechazar.click();
    await expect(rechazar).toHaveCount(0);
    expect(await eleccion(page)).toBe('rechazadas');
    expect(ga).toHaveLength(0);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Aceptar' })).toHaveCount(0);
    expect(ga).toHaveLength(0);
  });

  test.describe('en un móvil de 360 × 740', () => {
    test.use({ viewport: { width: 360, height: 740 } });

    test('el banner no tapa el botón flotante de WhatsApp', async ({ page }) => {
      await contarGa(page);
      // Sin el CTA del hero en pantalla, para que el flotante esté visible.
      await page.goto('/aviso-legal/');
      await expect(page.getByRole('button', { name: 'Aceptar' })).toBeVisible();
      const flotante = page.locator('a.boton-flotante');
      await expect(flotante).toBeVisible();
      const libre = await flotante.evaluate((el) => {
        const c = el.getBoundingClientRect();
        const arriba = document.elementFromPoint(c.left + c.width / 2, c.top + c.height / 2);
        return arriba !== null && el.contains(arriba);
      });
      expect(libre).toBe(true);
      const banner = await page.locator('.banner-cookies').boundingBox();
      expect(banner!.x).toBeGreaterThanOrEqual(0);
      expect(banner!.x + banner!.width).toBeLessThanOrEqual(360);
    });
  });
});

test.describe('sin ga4_id (build de ejemplo en :3100)', () => {
  // El mismo servidor que el project 'chromium' (http://127.0.0.1:3100 salvo E2E_PORT).
  test.use({ baseURL: e2eTarget(process.env).baseURL });

  test('no hay banner ni GA', async ({ page }) => {
    const ga = await contarGa(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Aceptar' })).toHaveCount(0);
    expect(ga).toHaveLength(0);
  });
});
