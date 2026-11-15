import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { configFormulario } from '../../lib/config';
import { cargarNegocio, type Negocio } from '../../lib/content';
import { metadata, Privacidad } from './page';

const negocio = cargarNegocio();
const config = configFormulario({});
const textoPlano = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const confirmado: Negocio = structuredClone(negocio);
confirmado.legal.razon_social = { valor: 'Duchas Madrid SL', confirmado: true };
confirmado.legal.nif = { valor: 'B12345678', confirmado: true };
confirmado.legal.domicilio = { valor: 'Calle Falsa 1, Madrid', confirmado: true };

const pinta = (retencion_dias: number, n: Negocio = confirmado) =>
  renderToStaticMarkup(<Privacidad negocio={n} config={{ ...config, retencion_dias }} modo="publico" />);

describe('privacidad', () => {
  it('la retención sale de config: 45 días', () => {
    const texto = textoPlano(pinta(45));
    expect(texto).toContain('45 días');
    expect(texto).not.toContain('120 días');
  });

  it('la retención sale de config: 120 días, y es el único «N días»', () => {
    const texto = textoPlano(pinta(120));
    expect(texto).toContain('120 días');
    expect(texto).not.toContain('45 días');
    expect(texto.match(/\d+ días/g)).toEqual(['120 días']);
  });

  it('responsable con razón social y NIF del negocio inyectado', () => {
    const texto = textoPlano(pinta(90));
    expect(texto).toContain('Duchas Madrid SL');
    expect(texto).toContain('B12345678');
  });

  it('secciones con H2, un solo H1, sin scripts ni estilos sueltos', () => {
    const html = pinta(90);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect((html.match(/<h2[\s>]/g) ?? []).length).toBeGreaterThanOrEqual(6);
    expect(html).toMatch(/class="[^"]*\btexto-largo\b[^"]*"/);
    expect(html).not.toContain('<script');
    expect(textoPlano(html)).not.toContain('<script');
    expect(html).not.toMatch(/<style|style=/);
    expect(textoPlano(html)).toMatch(/IP/);
    expect(textoPlano(html)).toMatch(/cifrada/);
  });

  it('sin datos confirmados en público dice «por confirmar» y no {{', () => {
    const html = pinta(90, negocio);
    expect(html).toContain('por confirmar');
    expect(html).not.toContain('{{');
  });

  it('exporta metadata con canonical propio', () => {
    expect(metadata.alternates.canonical).toMatch(/\/privacidad\/$/);
  });
});
