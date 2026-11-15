import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AcordeonFaq } from './AcordeonFaq';

const preguntas = [
  { p: '¿Recupera el brillo?', r: 'Sí, queda liso.' },
  { p: '¿Se puede cambiar el color?', r: 'Sí, elige el tono.' },
  { p: '¿Qué hago con un golpe?', r: 'Arréglalo pronto.' },
  { p: '¿Quitáis el moho?', r: 'Sí, cambiamos la junta.' },
  { p: '¿Reparáis bañeras?', r: 'Sí, también.' },
];

describe('AcordeonFaq', () => {
  const html = renderToStaticMarkup(<AcordeonFaq preguntas={preguntas} idBase="faq" />);

  it('pinta cada pregunta como un botón nativo cerrado', () => {
    for (const q of preguntas) expect(html).toContain(q.p.replace('¿', '¿'));
    const botones = html.match(/<button\b[^>]*>/g) ?? [];
    expect(botones).toHaveLength(5);
    for (const b of botones) expect(b).toContain('aria-expanded="false"');
  });

  it('sin estilos sueltos', () => {
    expect(html).not.toContain('style=');
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
