import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page, test } from '@playwright/test';

/** `pnpm e2e`: el filtro segmentado de /antes-y-despues/ con los pares de web/content/galeria.json. */
const galeria = JSON.parse(fs.readFileSync(path.resolve('web/content/galeria.json'), 'utf8')) as { servicio: string }[];
const servicios = JSON.parse(fs.readFileSync(path.resolve('web/content/servicios.json'), 'utf8')) as { slug: string; nombre: string; tipo: string }[];
const nombre = (slug: string) => servicios.find((s) => s.slug === slug)!.nombre;
const deServicio = (slug: string) => galeria.filter((p) => p.servicio === slug).length;
const VACIA = 'Aún no hemos subido fotos de este trabajo';

const abrir = async (page: Page) => {
  await page.goto('/antes-y-despues/');
  await page.waitForLoadState('networkidle');
};
const pares = (page: Page) => page.locator('[data-par]');
const filtro = (page: Page, etiqueta: string) => page.getByRole('radio', { name: etiqueta, exact: true });
/** Pulsa una opción hasta que quede elegida (espera a la hidratación). */
const elegir = async (page: Page, etiqueta: string) => {
  const opcion = filtro(page, etiqueta);
  await expect(async () => {
    await opcion.click();
    await expect(opcion).toHaveAttribute('aria-checked', 'true', { timeout: 500 });
  }).toPass();
};

test.describe('galería antes y después', () => {
  test('filtrar por platos de ducha deja solo sus pares; un servicio sin pares da el vacío; «Todos» los restaura', async ({ page }) => {
    await abrir(page);
    await expect(pares(page)).toHaveCount(galeria.length);

    await elegir(page, nombre('platos-de-ducha'));
    await expect(pares(page)).toHaveCount(deServicio('platos-de-ducha'));
    expect(deServicio('platos-de-ducha')).toBe(4);
    for (const s of await pares(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-par')))) expect(s).toBe('platos-de-ducha');

    await elegir(page, nombre('mamparas'));
    await expect(pares(page)).toHaveCount(0);
    await expect(page.getByText(VACIA)).toBeVisible();

    await elegir(page, 'Todos');
    await expect(pares(page)).toHaveCount(galeria.length);
    await expect(page.getByText(VACIA)).toHaveCount(0);
  });

  test.describe('en móvil', () => {
    test.use({ viewport: { width: 360, height: 740 } });

    test('el filtro no provoca scroll horizontal de la página', async ({ page }) => {
      await abrir(page);
      const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(desborda).toBe(false);
      await elegir(page, nombre('mamparas'));
      await expect(page.getByText(VACIA)).toBeVisible();
      const despues = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(despues).toBe(false);
    });

    test('cada opción del filtro muestra su etiqueta entera, sin recortar', async ({ page }) => {
      await abrir(page);
      const radios = page.getByRole('radio');
      const etiquetas = ['Todos', ...servicios.filter((s) => s.tipo !== 'empresas').map((s) => s.nombre)];
      await expect(radios).toHaveCount(etiquetas.length);
      const textos = await radios.evaluateAll((els) => els.map((el) => (el.textContent ?? '').trim()));
      expect([...textos].sort()).toEqual([...etiquetas].sort());
      for (let i = 0; i < etiquetas.length; i++) {
        const opcion = radios.nth(i);
        const texto = textos[i]!;
        await opcion.scrollIntoViewIfNeeded();
        await expect(opcion.getByText(texto, { exact: true })).toBeVisible();
        // Ninguna etiqueta recortada: ni la opción ni nada dentro de ella desborda su caja.
        const recortes = await opcion.evaluate((el) =>
          [el, ...Array.from(el.querySelectorAll('*'))]
            .filter((n) => n.scrollWidth > n.clientWidth && n.clientWidth > 0)
            .map((n) => `${n.tagName}.${n.className} ${n.scrollWidth}>${n.clientWidth}`),
        );
        expect(recortes, texto).toEqual([]);
        const caja = (await opcion.boundingBox())!;
        expect(caja.x, texto).toBeGreaterThanOrEqual(0);
        expect(caja.x + caja.width, texto).toBeLessThanOrEqual(360);
      }
      const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(desborda).toBe(false);
    });
  });
});
