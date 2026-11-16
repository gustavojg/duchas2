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

/** Sin scroll horizontal entre 320 y 1440 px (brain/design.md § Reglas, 4) y sin errores de consola. */
for (const ruta of ['/', '/zonas/']) {
  for (const ancho of [320, 360, 1440]) {
    test.describe(`${ruta} en ${ancho} px`, () => {
      test.use({ viewport: { width: ancho, height: 900 } });

      test('sin scroll horizontal ni errores de consola', async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
        await page.goto(ruta);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(scroll).toBeLessThanOrEqual(ancho);
        if (ruta === '/') {
          // La tabla «¿Reparar o cambiar?» cabe entera, sin scroll propio.
          const tabla = page.getByRole('table');
          await expect(tabla).toBeVisible();
          const medida = await tabla.evaluate((t) => {
            const caja = t.parentElement!.closest('[role="group"]') ?? t.parentElement!;
            return { tabla: t.scrollWidth, caja: caja.clientWidth, derecha: t.getBoundingClientRect().right };
          });
          expect(medida.tabla).toBeLessThanOrEqual(medida.caja);
          expect(medida.derecha).toBeLessThanOrEqual(ancho);
        }
        expect(errors).toEqual([]);
      });
    });
  }
}

/** Jerarquía de la portada: cada H2 de sección es mayor que los H3 de su sección (brain/design.md § Tipografía). */
for (const ancho of [360, 1280]) {
  test.describe(`jerarquía de la portada en ${ancho} px`, () => {
    test.use({ viewport: { width: ancho, height: 900 } });

    test('los H2 de sección son mayores que los H3 de su sección', async ({ page }) => {
      await page.goto('/');
      const medidas = await page.locator('section[aria-labelledby]').evaluateAll((secciones) =>
        secciones.flatMap((s) => {
          const h2 = s.querySelector(':scope > h2');
          if (!h2) return [];
          const px = (e: Element) => parseFloat(getComputedStyle(e).fontSize);
          return [{ titulo: h2.textContent ?? '', h2: px(h2), h3: [...s.querySelectorAll('h3')].map(px) }];
        }),
      );
      expect(medidas.map((m) => m.titulo)).toEqual([
        'Antes y después',
        '¿Reparar o cambiar?',
        'Cómo trabajamos',
        'Servicios',
        'Precios orientativos',
        'Preguntas frecuentes',
        'Zonas',
        'Mándanos una foto',
      ]);
      for (const { titulo, h2, h3 } of medidas) {
        for (const t of h3) expect(h2, `${titulo}: H2 ${h2}px frente a H3 ${t}px`).toBeGreaterThan(t);
      }
      const plato = page.locator('h3[data-type="display-3"]');
      await expect(plato).toHaveCount(1);
      const tamPlato = await plato.evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
      expect(medidas.find((m) => m.titulo === 'Servicios')!.h2).toBeGreaterThan(tamPlato);
    });

    if (ancho === 1280) {
      test('el icono del plato no deja hueco', async ({ page }) => {
        await page.goto('/');
        const caja = page.locator('.tarjeta-servicio-icono[data-tamano="grande"]');
        await expect(caja).toHaveCount(1);
        const { icono, svg } = await caja.evaluate((e) => ({
          icono: e.getBoundingClientRect().width,
          svg: e.querySelector('svg')!.getBoundingClientRect().width,
        }));
        expect(icono - svg, `caja ${icono}px frente a SVG ${svg}px`).toBeLessThanOrEqual(1);
      });
    }
  });
}

/** Legales y Quiénes somos (PaginaTexto): un único H1, sin errores de consola y el pie con los tres legales. */
for (const ruta of ['/aviso-legal/', '/privacidad/', '/cookies/', '/quienes-somos/']) {
  test(`${ruta} tiene un único H1, sin errores de consola, y el pie enlaza a los legales`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(ruta);
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toBeVisible();
    const legales = page.getByRole('navigation', { name: 'Legales' });
    for (const href of ['/aviso-legal/', '/privacidad/', '/cookies/']) {
      await expect(legales.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
}

test('la portada carga con su navegación', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
});

test('/health responde ok', async ({ request }) => {
  const res = await request.get('/health');
  expect(await res.json()).toMatchObject({ ok: true });
});
