import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { APP_NAME, NAV } from '../config';
import { DESCRIPTION, TAGLINE } from '../lib/site';
import { Frame } from '../ui/Frame';
import NotFound from './not-found';
import Home from './page';

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('portada', () => {
  const html = renderToStaticMarkup(<Frame brand={APP_NAME} nav={NAV}><Home /></Frame>);

  it('se pinta dentro del marco de Astryx con la marca, la frase del producto y su ilustración', () => {
    expect(html).toContain(APP_NAME);
    expect(html).toMatch(new RegExp(`<h1[^>]*>(?:(?!</h1>).)*${escapeRe(TAGLINE)}`, 's'));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain(DESCRIPTION);
    // AppShell de Astryx pinta el landmark principal como <div role="main">: equivale a <main>.
    expect(html).toMatch(/<main[\s>]|role="main"/);
    expect(html).toMatch(/<svg[^>]*role="img"[^>]*aria-label="Ilustración: plato de ducha/);
  });

  it('no muestra marcadores de datos pendientes ni hex sueltos', () => {
    expect(html).not.toMatch(/PENDIENTE|\{\{/);
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('no lleva enlaces a endpoints JSON', () => {
    const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
    for (const href of hrefs) expect(href).not.toMatch(/^\/(health|api)(\/|$|\?|#)/);
  });

  it('tiene una navegación con nombre y los enlaces de NAV', () => {
    expect(html).toMatch(/<nav[^>]*aria-label="[^"]+"/);
    for (const item of NAV) expect(html).toContain(`href="${item.href}"`);
  });

  it('no lleva estilos sueltos', () => {
    expect(html).not.toContain('<style');
    expect(html).not.toContain('style="');
  });
});

describe('404', () => {
  it('explica el error y lleva a la portada', () => {
    const html = renderToStaticMarkup(<NotFound />);
    expect(html).toMatch(/<h1[^>]*>(?:(?!<\/h1>).)*No encontramos esta página/s);
    expect(html).toContain('href="/"');
  });
});

describe('layout', () => {
  it('importa solo globals.css', () => {
    const src = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
    expect(src).toContain("import './globals.css'");
    expect(src).not.toMatch(/theme\.css|base\.css/);
  });
});
