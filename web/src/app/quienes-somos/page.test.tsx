import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargarNegocio, type Negocio } from '../../lib/content';
import { metadata, QuienesSomos } from './page';

const negocio = cargarNegocio();
const textoPlano = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const confirmado: Negocio = structuredClone(negocio);
confirmado.anios = { valor: 15, confirmado: true };
confirmado.garantia.anios = { valor: 2, confirmado: true };
confirmado.garantia.condiciones = { valor: 'Cubre desconchones y pérdida de brillo.', confirmado: true };

const pinta = (n: Negocio, modo: 'publico' | 'pendientes' = 'publico') =>
  renderToStaticMarkup(<QuienesSomos negocio={n} modo={modo} />);

describe('quiénes somos', () => {
  it('con años y garantía confirmados', () => {
    const texto = textoPlano(pinta(confirmado));
    expect(texto).toContain('15 años reparando baños');
    expect(texto).toContain('Garantía por escrito de 2 años');
    expect(texto).toContain('Cubre desconchones y pérdida de brillo.');
  });

  it('sin confirmar en público: sin años ni plazo ni marcadores', () => {
    const texto = textoPlano(pinta(negocio));
    expect(texto).not.toMatch(/\d+ años reparando/);
    expect(texto).toContain('Garantía por escrito');
    expect(texto).not.toMatch(/años/);
    expect(texto).not.toContain('{{');
  });

  it('forma de trabajar sin cifras ni plazos literales', () => {
    const texto = textoPlano(pinta(negocio));
    expect(texto).toMatch(/[Ss]in obras/);
    expect(texto).toMatch(/foto/);
    expect(texto).toMatch(/presupuesto/);
    // La marca de trabajo («Duchas 2») lleva una cifra: se quita antes de buscar cifras en el texto.
    expect(texto.replaceAll(negocio.marca.valor!, '')).not.toMatch(/\d/);
  });

  it('un solo H1 y la columna de texto largo', () => {
    const html = pinta(negocio);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/class="[^"]*\btexto-largo\b[^"]*"/);
    expect(html).not.toMatch(/<style|style=/);
  });

  it('exporta metadata con canonical propio', () => {
    expect(metadata.alternates.canonical).toMatch(/\/quienes-somos\/$/);
  });
});
