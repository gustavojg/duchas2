import { expect, test } from '@playwright/test';
import { formularioValido, PNG_MINIMO } from '../../src/smoke/contacto.ts';
import { esperadoContacto, rutasDelSmoke, statusContactoEsperado } from '../../src/smoke/staging.ts';
import { cargarServicios } from '../../web/src/lib/content.ts';

/**
 * Smoke de staging (`pnpm e2e:staging`; también corre en `pnpm e2e`): todas las rutas de web/src/lib/rutas.ts con
 * los servicios de servicios.json, /sitemap.xml, /robots.txt, el 404 y un único POST /api/contacto (cuenta 1 de 5
 * contra el límite por IP). E2E_EMAIL_DESTINO=con|sin (por defecto 'con') declara si el staging arrancó con email
 * de destino: 'con' exige 2xx y 'sin' exige 503.
 */
const RUTAS = rutasDelSmoke(cargarServicios());

test.describe('smoke de staging: rutas', () => {
  for (const ruta of RUTAS) {
    test(`${ruta} responde 200 con un h1`, async ({ page }) => {
      const res = await page.goto(ruta);
      expect(res?.status(), `estado de ${ruta}`).toBe(200);
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      await expect(h1).toBeVisible();
      expect((await h1.innerText()).trim()).not.toBe('');
    });
  }

  test('/sitemap.xml lista todas las rutas', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('<urlset');
    const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => new URL(m[1]!.trim()).pathname);
    for (const ruta of RUTAS) expect(locs, `falta ${ruta} en el sitemap`).toContain(ruta);
  });

  test('/robots.txt apunta al sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('Sitemap:');
  });

  test('una ruta inexistente da 404', async ({ request }) => {
    const res = await request.get('/ruta-que-no-existe-smoke/');
    expect(res.status()).toBe(404);
  });
});

test.describe('smoke de staging: contacto', () => {
  const esperado = esperadoContacto(process.env.E2E_EMAIL_DESTINO);

  test(`POST /api/contacto ${esperado} email de destino`, async ({ request }) => {
    const res = await request.post('/api/contacto', { multipart: formularioValido(PNG_MINIMO) });
    const status = res.status();
    const detalle = status === 429 ? 'límite por IP agotado (5 por 60 min)' : `E2E_EMAIL_DESTINO=${esperado}`;
    expect(statusContactoEsperado(esperado)(status), `llegó ${status} (${detalle})`).toBe(true);
  });
});
