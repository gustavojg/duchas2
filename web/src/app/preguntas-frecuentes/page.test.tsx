import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NAV } from '../../config';
import { configFormulario } from '../../lib/config';
import { cargarFaq, cargarNegocio } from '../../lib/content';
import { preguntasResueltas } from '../../lib/faq';
import { PAGES } from '../../lib/site';
import { metadata, PaginaFaq } from './page';

const faq = cargarFaq();
const negocio = cargarNegocio();
const retencion_dias = configFormulario({}).retencion_dias;
const temas = preguntasResueltas(faq, { negocio, retencion_dias, modo: 'publico' });
const todas = temas.flatMap((t) => t.preguntas);

const html = renderToStaticMarkup(
  <PaginaFaq faq={faq} negocio={negocio} retencion_dias={retencion_dias} modo="publico" />,
);
const sinScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
const textoPlano = sinScripts.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
/** El HTML escapa las comillas y los «&»; se compara con el texto escapado igual que React. */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

describe('/preguntas-frecuentes/', () => {
  it('tiene un solo H1 «Preguntas frecuentes»', () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>(?:(?!<\/h1>).)*Preguntas frecuentes/s);
  });

  it('un H2 con id por tema y un enlace de ancla a cada uno', () => {
    expect(temas.length).toBe(faq.temas.length);
    for (const t of temas) {
      expect(html).toMatch(new RegExp(`<h2[^>]*id="${t.ancla}"`));
      expect(html).toContain(`href="#${t.ancla}"`);
    }
  });

  it('pinta todas las preguntas de faq.json', () => {
    for (const t of faq.temas) for (const q of t.preguntas) expect(html).toContain(esc(q.p));
  });

  it('el JSON-LD FAQPage lleva las mismas preguntas y respuestas que se pintan, en orden', () => {
    const json = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1];
    expect(json, 'falta el JSON-LD').toBeDefined();
    const ld = JSON.parse(json!) as { '@type': string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity.map((q) => q.name)).toEqual(todas.map((q) => q.p));
    expect(ld.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(todas.map((q) => q.r));
    const pintadas = [...sinScripts.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].map((m) =>
      m[1].replace(/<[^>]+>/g, ''),
    );
    expect(pintadas).toEqual(todas.map((q) => esc(q.p)));
    for (const q of todas) expect(sinScripts).toContain(esc(q.r));
  });

  it('el JSON-LD FAQPage y el HTML incluyen la pregunta de zonas', () => {
    const json = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1];
    expect(json, 'falta el JSON-LD').toBeDefined();
    const ld = JSON.parse(json!) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(ld.mainEntity).toHaveLength(todas.length);
    const pregunta = '¿Venís a mi barrio o mi municipio?';
    const zonas = ld.mainEntity.find((q) => q.name === pregunta);
    expect(zonas, 'falta la pregunta de zonas en el FAQPage').toBeDefined();
    expect(zonas!.acceptedAnswer.text).toContain('Madrid');
    expect(zonas!.acceptedAnswer.text).toContain('WhatsApp');
    expect(sinScripts).toContain(esc(pregunta));
  });

  it('el texto público no deja pendientes, marcadores ni plazos literales', () => {
    expect(textoPlano).not.toContain('PENDIENTE');
    expect(textoPlano).not.toContain('{');
    expect(textoPlano).not.toMatch(/\d+\s*h\b/);
  });

  it('sin estilos sueltos', () => {
    expect(html).not.toContain('style=');
    expect(html).not.toContain('<style');
  });

  it('metadata, PAGES y NAV incluyen la página', () => {
    expect(String(metadata.title)).toMatch(/^Preguntas frecuentes · /);
    expect(metadata.description).toBeTruthy();
    expect(PAGES).toContain('/preguntas-frecuentes/');
    expect(NAV.map((n) => n.href)).toContain('/preguntas-frecuentes/');
  });
});
