import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page, type Request, test } from '@playwright/test';
import { dataDirE2E } from '../../playwright.config.ts';

/**
 * `pnpm e2e`: formulario de contacto, página /contacto/ y botón flotante de WhatsApp contra `pnpm start`.
 * playwright.config.ts arranca el servidor con MAIL_TRANSPORT=file y un DATA_DIR de e2e que vacía al empezar:
 * el mailer deja cada mensaje como .eml en DATA_DIR/mail (src/mailer.ts).
 */
const OUTBOX = path.join(dataDirE2E(), 'mail');
const MB = 1024 * 1024;

/** JPEG mínimo: el servidor solo mira los bytes mágicos (src/domain/foto.ts). */
const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]), Buffer.from('JFIF\0'), Buffer.alloc(64), Buffer.from([0xff, 0xd9])]);

/** Peticiones a /api/contacto hechas desde la página. */
function peticionesApi(page: Page): Request[] {
  const lista: Request[] = [];
  page.on('request', (r) => {
    if (new URL(r.url()).pathname.startsWith('/api/contacto')) lista.push(r);
  });
  return lista;
}

const formulario = (page: Page) => page.getByRole('form', { name: 'Formulario de contacto' });
const enviar = (page: Page) => page.locator('#enviar-peticion');
const flotante = (page: Page) => page.locator('a.boton-flotante');

async function rellenar(page: Page, { nombre = 'Marta', telefono = '611 22 33 44' } = {}) {
  const f = formulario(page);
  await f.getByLabel('Teléfono').fill(telefono);
  await f.getByLabel('Nombre').fill(nombre);
  await f.getByLabel('Zona o barrio').fill('Carabanchel');
  await f.getByLabel('Mensaje').fill('Desconchón en el plato');
  await f.getByLabel('He leído y acepto la política de privacidad').check();
}

const emls = () => (fs.existsSync(OUTBOX) ? fs.readdirSync(OUTBOX).filter((f) => f.endsWith('.eml')) : []);

test.describe('formulario de /contacto/', () => {
  test('vacío: errores junto a nombre, teléfono y casilla, y ninguna petición', async ({ page }) => {
    const api = peticionesApi(page);
    await page.goto('/contacto/');
    await enviar(page).click();
    const f = formulario(page);
    await expect(f.getByText('Falta tu teléfono.')).toBeVisible();
    await expect(f.getByText('Dinos tu nombre.')).toBeVisible();
    await expect(f.getByText('Marca la casilla de privacidad para enviar.')).toBeVisible();
    await expect(f.getByLabel('Teléfono')).toHaveAttribute('aria-invalid', 'true');
    await expect(f.getByLabel('Nombre')).toHaveAttribute('aria-invalid', 'true');
    expect(api).toHaveLength(0);
  });

  test('envío completo con foto JPEG: confirmación y .eml con la foto adjunta en el outbox', async ({ page }) => {
    const antes = new Set(emls());
    await page.goto('/contacto/');
    await rellenar(page);
    await page.locator('input[type="file"][name="foto"]').setInputFiles({ name: 'plato.jpg', mimeType: 'image/jpeg', buffer: JPEG });
    await expect(formulario(page).getByText('plato.jpg')).toBeVisible();
    const respuesta = page.waitForResponse((r) => new URL(r.url()).pathname === '/api/contacto');
    await enviar(page).click();
    expect((await respuesta).status()).toBe(201);
    await expect(page.getByText(/Recibido\. Te respondemos/)).toBeVisible();
    await expect(page.getByText('¿Quieres adelantar la foto? Mándala por WhatsApp')).toBeVisible();

    await expect.poll(() => emls().filter((f) => !antes.has(f)).length).toBe(1);
    const nuevo = emls().find((f) => !antes.has(f))!;
    const eml = fs.readFileSync(path.join(OUTBOX, nuevo), 'utf8');
    expect(eml).toMatch(/Content-Disposition: attachment/i);
    expect(eml).toMatch(/Content-Type: image\/jpeg/i);
    expect(eml).toContain('Marta');
  });

  test('foto de más de 10 MB: aviso y sin enviar', async ({ page }) => {
    const api = peticionesApi(page);
    await page.goto('/contacto/');
    await rellenar(page);
    await page.locator('input[type="file"][name="foto"]').setInputFiles({ name: 'grande.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(11 * MB, 0xff) });
    await enviar(page).click();
    await expect(formulario(page).getByText('La foto pesa más de 10 MB; prueba con otra o envíala por WhatsApp')).toBeVisible();
    expect(api).toHaveLength(0);
  });

  test('tipo no admitido (.gif): aviso y sin enviar', async ({ page }) => {
    const api = peticionesApi(page);
    await page.goto('/contacto/');
    await rellenar(page);
    await page.locator('input[type="file"][name="foto"]').setInputFiles({ name: 'animado.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') });
    await enviar(page).click();
    await expect(formulario(page).getByText('Solo se admiten fotos (JPG, PNG, WebP o HEIC)')).toBeVisible();
    expect(api).toHaveLength(0);
  });

  test('red caída: aviso con teléfono y WhatsApp, y lo escrito sigue en los campos', async ({ page }) => {
    await page.route('**/api/contacto', (r) => r.abort());
    await page.goto('/contacto/');
    await rellenar(page);
    await enviar(page).click();
    const aviso = page.getByRole('alert').filter({ hasText: 'No hemos podido enviar tu petición' });
    await expect(aviso).toBeVisible();
    await expect(aviso.locator('a[href^="tel:"]')).toHaveCount(1);
    await expect(aviso.locator('a[href^="https://wa.me/"]')).toHaveCount(1);
    const f = formulario(page);
    await expect(f.getByLabel('Nombre')).toHaveValue('Marta');
    await expect(f.getByLabel('Teléfono')).toHaveValue('611 22 33 44');
    await expect(f.getByLabel('Zona o barrio')).toHaveValue('Carabanchel');
  });

  test('429: aviso de límite con Llamar y WhatsApp', async ({ page }) => {
    await page.route('**/api/contacto', (r) =>
      r.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ error: 'limite' }) }),
    );
    await page.goto('/contacto/');
    await rellenar(page);
    await enviar(page).click();
    const aviso = page.getByRole('alert').filter({ hasText: 'Has enviado varias peticiones; llámanos o escríbenos por WhatsApp' });
    await expect(aviso).toBeVisible();
    await expect(aviso.getByRole('link', { name: 'Llamar' })).toHaveAttribute('href', /^tel:\+34\d{9}$/);
    await expect(aviso.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+\?text=/);
  });

  test('un solo teléfono y un solo WhatsApp en /contacto/', async ({ page }) => {
    await page.goto('/contacto/');
    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
    const tel = new Set(hrefs.filter((h) => h.startsWith('tel:')));
    const wa = new Set(hrefs.filter((h) => h.startsWith('https://wa.me/')));
    expect(tel.size).toBe(1);
    expect(wa.size).toBe(1);
  });
});

test.describe('botón flotante de WhatsApp', () => {
  test('existe en /, /contacto/ y otra ruta, con el mensaje de cada una', async ({ page }) => {
    const hrefs: Record<string, string> = {};
    for (const ruta of ['/', '/contacto/', '/platos-de-ducha/']) {
      await page.goto(ruta);
      await expect(flotante(page)).toHaveCount(1);
      await expect(flotante(page)).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+\?text=/);
      await expect(flotante(page)).toHaveAttribute('href', ruta === '/platos-de-ducha/' ? /platos%20de%20ducha/ : /.+/);
      hrefs[ruta] = (await flotante(page).getAttribute('href'))!;
    }
    expect(hrefs['/']).not.toBe(hrefs['/platos-de-ducha/']);
  });

  test.describe('en un móvil de 360 × 740', () => {
    test.use({ viewport: { width: 360, height: 740 } });

    test('mide ≥ 48 px y se oculta mientras se ve «Enviar petición», sin taparlo', async ({ page }) => {
      await page.goto('/contacto/');
      const boton = flotante(page);
      await expect(enviar(page)).not.toBeInViewport();
      await expect(boton).toBeVisible();
      // Tras hidratar, el flotante se vuelve a crear una vez (ruta real): se mide cuando ya está estable.
      await expect.poll(async () => (await boton.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
      const caja = (await boton.boundingBox())!;
      expect(caja.x + caja.width).toBeLessThanOrEqual(360);
      expect(caja.y + caja.height).toBeLessThanOrEqual(740);

      await enviar(page).scrollIntoViewIfNeeded();
      await expect(enviar(page)).toBeInViewport();
      await expect(boton).toBeHidden();
      await expect(boton).toHaveAttribute('aria-hidden', 'true');
      // Con el flotante oculto, el punto central de «Enviar petición» es el propio botón.
      const tapa = await enviar(page).evaluate((el) => {
        const r = el.getBoundingClientRect();
        const arriba = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return !!arriba && !el.contains(arriba);
      });
      expect(tapa).toBe(false);
    });

    test('las cuatro opciones de «¿Qué quieres reparar?» se leen enteras en /contacto/', async ({ page }) => {
      await page.goto('/contacto/');
      const grupo = page.getByRole('radiogroup', { name: '¿Qué quieres reparar?' });
      const opciones = grupo.getByRole('radio');
      await expect(opciones).toHaveCount(4);
      for (const [i, texto] of ['Plato de ducha', 'Bañera', 'Azulejos', 'Otro'].entries()) {
        const opcion = opciones.nth(i);
        await opcion.scrollIntoViewIfNeeded();
        await expect(opcion).toContainText(texto);
        await expect(opcion.getByText(texto, { exact: true })).toBeVisible();
        // Ninguna etiqueta recortada: ni la opción ni ningún elemento dentro de ella desborda su caja.
        const recortes = await opcion.evaluate((el) =>
          [el, ...Array.from(el.querySelectorAll('*'))]
            .filter((n) => n.scrollWidth > n.clientWidth && n.clientWidth > 0)
            .map((n) => `${n.tagName}.${n.className} ${n.scrollWidth}>${n.clientWidth}`),
        );
        expect(recortes, texto).toEqual([]);
        const caja = (await opcion.boundingBox())!;
        expect(caja.x + caja.width, texto).toBeLessThanOrEqual(360);
      }
    });

    test('las tarjetas de las tres vías no se recortan en /contacto/', async ({ page }) => {
      await page.goto('/contacto/');
      const tarjetas = page.locator('ul li').filter({ has: page.getByRole('heading', { name: /^(WhatsApp|Llamar|Formulario)$/ }) });
      await expect(tarjetas).toHaveCount(3);
      for (let i = 0; i < 3; i++) {
        const tarjeta = tarjetas.nth(i);
        await tarjeta.scrollIntoViewIfNeeded();
        const caja = (await tarjeta.boundingBox())!;
        expect(caja.x, `tarjeta ${i}`).toBeGreaterThanOrEqual(0);
        expect(caja.x + caja.width, `tarjeta ${i}`).toBeLessThanOrEqual(360);
        const recortes = await tarjeta.evaluate((el) =>
          [el, ...Array.from(el.querySelectorAll('*'))]
            .filter((n) => n.scrollWidth > n.clientWidth && n.clientWidth > 0)
            .map((n) => `${n.tagName}.${n.className} ${n.scrollWidth}>${n.clientWidth}`),
        );
        expect(recortes, `tarjeta ${i}`).toEqual([]);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
      const cinta = page.locator('.cinta-etiqueta');
      await cinta.scrollIntoViewIfNeeded();
      await expect(cinta).toBeVisible();
      const cajaCinta = (await cinta.boundingBox())!;
      expect(cajaCinta.x).toBeGreaterThanOrEqual(0);
      expect(cajaCinta.x + cajaCinta.width).toBeLessThanOrEqual(360);
    });

    test('en la portada se oculta mientras se ve el CTA del hero', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#cta-hero')).toBeInViewport();
      await expect(flotante(page)).toBeHidden();
    });
  });
});
