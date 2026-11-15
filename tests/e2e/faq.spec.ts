import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import { anclaTema } from '../../web/src/lib/faq.ts';

/** `pnpm e2e`: el acordeón de /preguntas-frecuentes/ con ratón y teclado, y las anclas de los temas. */
const faq = JSON.parse(fs.readFileSync(path.resolve('web/content/faq.json'), 'utf8')) as {
  temas: { tema: string; preguntas: { p: string; r: string }[] }[];
};
const primera = faq.temas[0].preguntas[0];

const abrirPagina = async (page: Page) => {
  await page.goto('/preguntas-frecuentes/');
  const boton = page.getByRole('button', { name: primera.p });
  await expect(boton).toHaveAttribute('aria-expanded', 'false');
  const respuesta = page.getByText(primera.r);
  await expect(respuesta).toBeHidden();
  return { boton, respuesta };
};

test.describe('acordeón de preguntas frecuentes', () => {
  test('se abre y se cierra con clic', async ({ page }) => {
    const { boton, respuesta } = await abrirPagina(page);
    await boton.click();
    await expect(boton).toHaveAttribute('aria-expanded', 'true');
    await expect(respuesta).toBeVisible();
    await boton.click();
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
    await expect(respuesta).toBeHidden();
  });

  test('se abre y se cierra con Enter', async ({ page }) => {
    const { boton, respuesta } = await abrirPagina(page);
    await boton.focus();
    await page.keyboard.press('Enter');
    await expect(boton).toHaveAttribute('aria-expanded', 'true');
    await expect(respuesta).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
  });

  test('se abre y se cierra con Espacio', async ({ page }) => {
    const { boton, respuesta } = await abrirPagina(page);
    await boton.focus();
    await page.keyboard.press('Space');
    await expect(boton).toHaveAttribute('aria-expanded', 'true');
    await expect(respuesta).toBeVisible();
    await page.keyboard.press('Space');
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
  });

  test('un enlace del índice lleva al H2 de su tema', async ({ page }) => {
    await page.goto('/preguntas-frecuentes/');
    const tema = faq.temas[faq.temas.length - 1].tema;
    const ancla = anclaTema(tema);
    await page.getByRole('list', { name: 'Temas' }).getByRole('link', { name: tema }).click();
    await expect(page).toHaveURL(new RegExp(`#${ancla}$`));
    const h2 = page.getByRole('heading', { level: 2, name: tema });
    await expect(h2).toHaveAttribute('id', ancla);
    await expect(h2).toBeInViewport();
  });
});

test.describe('en un móvil de 360 × 740', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('sin errores de consola ni scroll horizontal', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto('/preguntas-frecuentes/');
    await expect(page.getByRole('heading', { level: 1, name: 'Preguntas frecuentes' })).toBeVisible();
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(ancho).toBeLessThanOrEqual(360);
    expect(errors).toEqual([]);
  });
});
