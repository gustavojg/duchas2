import { expect, type Locator, test } from '@playwright/test';

/** `pnpm e2e`: navegador real contra `pnpm start` (playwright.config.ts levanta el servidor). */
test.describe('portada en un móvil de 360 × 740', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  /** Visible dentro de la primera pantalla, sin scroll, y con área táctil ≥ 44 × 44 px. */
  async function enPrimeraPantalla(loc: Locator, { tactil = true } = {}) {
    await expect(loc).toBeVisible();
    const box = await loc.boundingBox();
    expect(box, 'sin caja').not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(360);
    expect(box!.y + box!.height).toBeLessThanOrEqual(740);
    if (tactil) {
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  }

  test('H1, «Llamar» y «Manda la foto por WhatsApp» se ven sin scroll y miden ≥ 44 px', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto('/');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await enPrimeraPantalla(page.getByRole('heading', { level: 1 }), { tactil: false });

    const whatsapp = page.getByRole('link', { name: 'Manda la foto por WhatsApp' });
    await expect(whatsapp).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+\?text=/);
    await enPrimeraPantalla(whatsapp);

    const llamar = page.getByRole('link', { name: 'Llamar' });
    expect(await llamar.count()).toBeGreaterThanOrEqual(1);
    for (const l of await llamar.all()) await expect(l).toHaveAttribute('href', /^tel:\+34\d{9}$/);
    await enPrimeraPantalla(llamar.first());

    expect(errors).toEqual([]);
  });

  test('el contenido de la portada tiene margen lateral (H1 y WhatsApp entre x=8 y x=352)', async ({ page }) => {
    await page.goto('/');
    for (const loc of [
      page.getByRole('heading', { level: 1 }),
      page.getByRole('link', { name: 'Manda la foto por WhatsApp' }),
    ]) {
      const box = await loc.boundingBox();
      expect(box, 'sin caja').not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(8);
      expect(box!.x + box!.width).toBeLessThanOrEqual(352);
    }
  });

  test('sin scroll horizontal', async ({ page }) => {
    await page.goto('/');
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(ancho).toBeLessThanOrEqual(360);
  });
});

test('la portada carga con su navegación', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
});

test('/health responde ok', async ({ request }) => {
  const res = await request.get('/health');
  expect(await res.json()).toMatchObject({ ok: true });
});
