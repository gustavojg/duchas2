import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LEGALES } from '../config';
import { configFormulario } from '../lib/config';
import { cargarNegocio, type Negocio } from '../lib/content';
import { PieSitio } from './PieSitio';

const negocio = cargarNegocio();
const config = { ...configFormulario({}), retencion_dias: 45 };
const textoPlano = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const pinta = (opts: { n?: Negocio; servicios?: { slug: string; nombre: string }[] } = {}) =>
  renderToStaticMarkup(
    <PieSitio negocio={opts.n ?? negocio} config={config} modo="publico" legales={LEGALES} servicios={opts.servicios ?? []} />,
  );

/** Teléfonos españoles del HTML, normalizados a sus 9 últimas cifras. */
const TELEFONO = /(?:\+34|0034)?[\s.-]?[6-9]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g;
const nueve = (s: string) => s.replace(/\D/g, '').slice(-9);

describe('PieSitio', () => {
  it('marca, contacto, legales y la retención de la foto', () => {
    const html = pinta();
    expect(textoPlano(html)).toContain(negocio.marca.valor!);
    expect(html).toContain('Guardamos tu foto 45 días');
    expect(html).toContain('href="tel:+34600000000"');
    expect(textoPlano(html)).toContain(negocio.telefono.valor!);
    expect(html).toMatch(/href="https:\/\/wa\.me\/34600000000\?text=[^"]+"/);
    expect(html).toMatch(/<nav[^>]*aria-label="Legales"/);
    for (const href of ['/aviso-legal/', '/privacidad/', '/cookies/']) expect(html).toContain(`href="${href}"`);
    expect(html).not.toMatch(/<style|style=/);
  });

  it('servicios: enlaces a su página, y sin servicios no hay bloque', () => {
    expect(pinta({ servicios: [{ slug: 'plato-de-ducha', nombre: 'Plato de ducha' }] })).toContain(
      'href="/servicios/plato-de-ducha/"',
    );
    expect(pinta({ servicios: [] })).not.toContain('/servicios/');
  });

  it('horario solo si está confirmado', () => {
    const conHorario = structuredClone(negocio);
    conHorario.horario = { valor: 'De lunes a viernes, de 9 a 19 h', confirmado: true };
    expect(textoPlano(pinta({ n: conHorario }))).toContain('De lunes a viernes, de 9 a 19 h');
    expect(textoPlano(pinta())).not.toMatch(/[Hh]orario/);
  });

  it('sin teléfono ni WhatsApp no hay enlaces de contacto', () => {
    const sin = structuredClone(negocio);
    sin.telefono = { valor: null, confirmado: false };
    sin.whatsapp = { valor: null, confirmado: false };
    const html = pinta({ n: sin });
    expect(html).not.toContain('tel:');
    expect(html).not.toContain('wa.me');
  });

  it('todos los números con forma de teléfono son el de negocio.json', () => {
    const html = pinta({ servicios: [{ slug: 'plato-de-ducha', nombre: 'Plato de ducha' }] });
    const numeros = [...html.matchAll(TELEFONO)].map((m) => nueve(m[0]));
    expect(numeros.length).toBeGreaterThan(0);
    expect(new Set(numeros)).toEqual(new Set([nueve(negocio.telefono.valor!)]));
  });
});
