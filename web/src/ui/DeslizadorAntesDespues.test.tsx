import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ParGaleria } from '../lib/content';
import { DeslizadorAntesDespues } from './DeslizadorAntesDespues';

const conHueco: ParGaleria = {
  servicio: 'platos-de-ducha',
  antes: null,
  despues: null,
  alt_antes: 'Plato desconchado',
  alt_despues: 'Plato esmaltado',
  hueco: 'Plato desconchado antes y después del esmaltado',
};

const conFotos: ParGaleria = {
  servicio: 'platos-de-ducha',
  antes: '/fotos/a.webp',
  despues: '/fotos/b.webp',
  alt_antes: 'Plato desconchado',
  alt_despues: 'Plato esmaltado',
};

/** Astryx (AspectRatio, Slider) pinta variables CSS internas en `style`; eso no es estilo propio. */
const sinVariablesAstryx = (html: string) => html.replace(/ style="(?:--[\w-]+:[\w.\s-]+;?)+"/g, '');

describe('DeslizadorAntesDespues', () => {
  it('con hueco: cintas, slider en 50 y la ilustración rotulada', () => {
    const html = renderToStaticMarkup(<DeslizadorAntesDespues par={conHueco} />);
    expect(html).toContain('ANTES');
    expect(html).toContain('DESPUÉS');
    expect(html).toMatch(/role="slider"[^>]*aria-valuenow="50"/);
    expect(html).toContain('Comparar antes y después');
    expect(html).toContain('Pronto, fotos reales de este trabajo');
    expect(html.split('Pronto, fotos reales de este trabajo')).toHaveLength(2);
    expect(html.split(conHueco.hueco!)).toHaveLength(2);
    // El asa sigue al Slider también sobre la ilustración.
    expect(html).toMatch(/<line[^>]*x1="50"[^>]*stroke="var\(--/);
    expect(html).toMatch(/<circle[^>]*cx="50"[^>]*fill="var\(--/);
    expect(sinVariablesAstryx(html)).not.toContain('style=');
  });

  it('con fotos: recorte SVG con clipPath, las dos rutas, asa y sin style= propio', () => {
    const html = renderToStaticMarkup(<DeslizadorAntesDespues par={conFotos} />);
    expect(html).toMatch(/<clipPath[^>]*>\s*<rect[^>]*width="50"/);
    expect(html).toContain('/fotos/a.webp');
    expect(html).toContain('/fotos/b.webp');
    expect(html).toMatch(/<image[^>]*clip-path="url\(#[^"]+\)"[^>]*href="\/fotos\/b\.webp"|<image[^>]*href="\/fotos\/b\.webp"[^>]*clip-path="url\(#[^"]+\)"/);
    expect(html).toContain('aria-label="Plato desconchado"');
    expect(html).toContain('Plato esmaltado');
    expect(html).toMatch(/<line[^>]*stroke="var\(--/);
    expect(html).toMatch(/<circle[^>]*fill="var\(--/);
    expect(html).toMatch(/role="slider"[^>]*aria-valuenow="50"/);
    expect(html).not.toContain('ILUSTRACIÓN');
    expect(sinVariablesAstryx(html)).not.toContain('style=');
  });

  it('sin hex ni <style', () => {
    for (const par of [conHueco, conFotos]) {
      const html = renderToStaticMarkup(<DeslizadorAntesDespues par={par} />);
      expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(html).not.toContain('<style');
    }
  });
});
