import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ParGaleria } from '../lib/content';
import { HuecoFoto } from './HuecoFoto';

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
  despues: '/fotos/x.webp',
  alt_antes: 'Plato desconchado',
  alt_despues: 'Plato esmaltado',
};

/** Astryx (AspectRatio, Slider) pinta variables CSS internas en `style`; eso no es estilo propio. */
const sinVariablesAstryx = (html: string) => html.replace(/ style="(?:--[\w-]+:[\w.\s-]+;?)+"/g, '');

describe('HuecoFoto', () => {
  it('sin foto pinta la ilustración con la cinta, el aviso y el hueco', () => {
    const html = renderToStaticMarkup(<HuecoFoto par={conHueco} lado="despues" />);
    expect(html).toContain('ILUSTRACIÓN');
    expect(html).toContain('Pronto, fotos reales de este trabajo');
    expect(html).toContain(conHueco.hueco);
    expect(html).toMatch(/<svg[^>]*role="img"[^>]*aria-label="Plato esmaltado"/);
    expect(html).not.toMatch(/<img[\s>]/);
  });

  it('con foto pinta un <img> nativo con el alt del lado', () => {
    const html = renderToStaticMarkup(<HuecoFoto par={conFotos} lado="despues" />);
    expect(html).toMatch(/<img[^>]*src="\/fotos\/x\.webp"[^>]*alt="Plato esmaltado"/);
    expect(html).not.toContain('ILUSTRACIÓN');
    const antes = renderToStaticMarkup(<HuecoFoto par={conFotos} lado="antes" />);
    expect(antes).toMatch(/<img[^>]*src="\/fotos\/a\.webp"[^>]*alt="Plato desconchado"/);
  });

  it('compacta: solo la ilustración, sin cintas, sin el aviso ni el hueco', () => {
    const html = renderToStaticMarkup(<HuecoFoto par={conHueco} lado="despues" compacta />);
    expect(html).not.toContain('ILUSTRACIÓN');
    expect(html).not.toContain('ANTES · DESPUÉS');
    expect(html).toMatch(/<svg[^>]*role="img"/);
    expect(html).not.toContain('Pronto, fotos reales de este trabajo');
    expect(html).not.toContain(conHueco.hueco);
  });

  it('sin style= propio ni hex', () => {
    for (const par of [conHueco, conFotos]) {
      const html = sinVariablesAstryx(renderToStaticMarkup(<HuecoFoto par={par} lado="antes" />));
      expect(html).not.toContain('style=');
      expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });
});
