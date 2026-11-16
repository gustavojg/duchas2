import fs from 'node:fs';
import path from 'node:path';
import { expect, type Locator, type Page, test } from '@playwright/test';

/** `pnpm e2e`: el deslizador antes/después y el acordeón de la FAQ resumida de la portada. */
const faq = JSON.parse(fs.readFileSync(path.resolve('web/content/faq.json'), 'utf8')) as {
  temas: { tema: string; preguntas: { p: string; r: string; en_portada: boolean }[] }[];
};
// La pregunta, no la respuesta: la respuesta lleva marcadores {…} que resuelve faq.ts.
const primera = faq.temas.flatMap((t) => t.preguntas).find((q) => q.en_portada)!;

/** Abre la portada y espera a que el Slider esté hidratado (responde al teclado). */
const abrirPortada = async (page: Page): Promise<Locator> => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const slider = page.getByRole('slider', { name: 'Comparar antes y después' });
  await expect(slider).toHaveAttribute('aria-valuenow', '50');
  return slider;
};

const valor = async (slider: Locator) => Number(await slider.getAttribute('aria-valuenow'));

test.describe('deslizador antes/después de la portada', () => {
  test('las flechas mueven la posición', async ({ page }) => {
    const slider = await abrirPortada(page);
    await slider.focus();
    await expect(async () => {
      const antes = await valor(slider);
      await page.keyboard.press('ArrowRight');
      expect(await valor(slider)).toBeGreaterThan(antes);
    }).toPass();
    const subido = await valor(slider);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => valor(slider)).toBeLessThan(subido);
  });
});

test.describe('deslizador con el dedo', () => {
  test.use({ hasTouch: true, viewport: { width: 360, height: 740 } });

  test('arrastrar el asa cambia aria-valuenow', async ({ page }) => {
    const slider = await abrirPortada(page);
    await slider.scrollIntoViewIfNeeded();
    const caja = await slider.boundingBox();
    expect(caja).not.toBeNull();
    const x = caja!.x + caja!.width / 2;
    const y = caja!.y + caja!.height / 2;
    // Toques reales de Chromium (CDP): el navegador genera los pointer events de tipo touch con isTrusted.
    const cdp = await page.context().newCDPSession(page);
    const toque = (type: 'touchStart' | 'touchMove' | 'touchEnd', px: number) =>
      cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: px, y }] });
    await toque('touchStart', x);
    for (let paso = 1; paso <= 10; paso++) await toque('touchMove', x + paso * 10);
    await toque('touchEnd', x + 100);
    await expect.poll(() => valor(slider)).toBeGreaterThan(50);
  });
});

test.describe('acordeón de la FAQ resumida de la portada', () => {
  const abrir = async (page: Page) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const seccion = page.getByRole('region', { name: 'Preguntas frecuentes' });
    const boton = seccion.getByRole('button', { name: primera.p });
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
    return boton;
  };

  test('se abre y se cierra con clic', async ({ page }) => {
    const boton = await abrir(page);
    await boton.click();
    await expect(boton).toHaveAttribute('aria-expanded', 'true');
    await boton.click();
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
  });

  test('se abre y se cierra con Enter', async ({ page }) => {
    const boton = await abrir(page);
    await boton.focus();
    await page.keyboard.press('Enter');
    await expect(boton).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Enter');
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
  });

  test('se abre y se cierra con Espacio', async ({ page }) => {
    const boton = await abrir(page);
    await boton.focus();
    await page.keyboard.press('Space');
    await expect(boton).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Space');
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('portada en un móvil de 360 × 740', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('sin errores de consola ni scroll horizontal', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await abrirPortada(page);
    await page.getByRole('slider', { name: 'Comparar antes y después' }).scrollIntoViewIfNeeded();
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(ancho).toBeLessThanOrEqual(360);
    expect(errors).toEqual([]);
  });

  test('la cinta «Después» queda a la derecha del centro del slider y «Antes» a la izquierda', async ({ page }) => {
    const slider = await abrirPortada(page);
    await slider.scrollIntoViewIfNeeded();
    const seccion = page.locator('section[aria-labelledby="portada-antes-despues-titulo"]');
    const cintas = seccion.locator('.deslizador-cintas');
    const caja = await slider.boundingBox();
    const antes = await cintas.getByText('ANTES', { exact: true }).boundingBox();
    const despues = await cintas.getByText('DESPUÉS', { exact: true }).boundingBox();
    expect(caja && antes && despues).toBeTruthy();
    const centro = caja!.x + caja!.width / 2;
    expect(despues!.x).toBeGreaterThan(centro);
    expect(antes!.x).toBeLessThan(centro);
  });
});
