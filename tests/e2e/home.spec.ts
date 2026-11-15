import { expect, test } from '@playwright/test';

/** `pnpm e2e`: navegador real contra `pnpm start` (playwright.config.ts levanta el servidor). */
test('la portada carga con su navegación y sin errores de consola', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('/health responde ok', async ({ request }) => {
  const res = await request.get('/health');
  expect(await res.json()).toMatchObject({ ok: true });
});
