import { renderToStaticMarkup } from 'react-dom/server';
import { Text } from '@astryxdesign/core/Text';
import { describe, expect, it } from 'vitest';
import { configFormulario } from '../../lib/config';
import { cargarNegocio, type Negocio } from '../../lib/content';
import { canonicalUrl } from '../../lib/site';
import { Contacto, generateMetadata } from './page';

const negocio = cargarNegocio();
const config = configFormulario({});
const pinta = (n: Negocio = negocio, c = config) => renderToStaticMarkup(<Contacto negocio={n} config={c} modo="publico" />);
const textoPlano = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const h1s = (html: string) => [...html.matchAll(/<h1[^>]*>((?:(?!<\/h1>).)*)<\/h1>/gs)].map((m) => m[1].replace(/<[^>]+>/g, ''));
/** El CheckboxInput de Astryx pinta este estilo en línea (centrado del input, StyleX); no es nuestro. */
const sinEstiloAstryx = (html: string) => html.replaceAll('style="--x-transform:translate(-50%, -50%)"', '');

const conDatos: Negocio = structuredClone(negocio);
conDatos.email = { valor: 'hola@ejemplo.test', confirmado: true };
/** Trozo del HTML de cada tarjeta de vía: desde su `astryx-card` hasta la siguiente o el cierre de la lista. */
const tarjetas = (html: string) => {
  const inicios = [...html.matchAll(/class="astryx-card/g)].map((m) => m.index);
  return inicios.map((i, n) => html.slice(i, inicios[n + 1] ?? html.indexOf('</ul>', i)));
};
/** Valor de `data-type` del Text que contiene la frase. */
const tipoDe = (html: string, frase: string) => html.match(new RegExp(`<p[^>]*data-type="([^"]+)"[^>]*>${frase}</p>`))?.[1];

conDatos.horario = { valor: 'De lunes a viernes, de 9 a 19 h', confirmado: true };

describe('/contacto/', () => {
  const html = pinta();
  const texto = textoPlano(html);

  it('un solo H1 con el texto exacto', () => {
    expect(h1s(html)).toEqual(['Mándanos una foto y te decimos si tiene arreglo']);
  });

  it('con el contenido sin confirmar y modo público no hay pendientes ni nulos', () => {
    expect(texto).not.toMatch(/PENDIENTE|\{\{|\bnull\b|undefined/);
    expect(html).not.toContain('mailto:');
    expect(texto).not.toMatch(/Horario/);
  });

  it('teléfono y WhatsApp aparecen una sola vez cada uno', () => {
    expect(html.match(/href="tel:\+34600000000"/g)).toHaveLength(1);
    expect(html.match(/href="https:\/\/wa\.me\//g)).toHaveLength(1);
    expect(html).toMatch(/data-variant="secondary"[^>]*href="https:\/\/wa\.me\/34600000000\?text=/);
  });

  it('con email y horario los muestra', () => {
    const h = pinta(conDatos);
    expect(h).toContain('href="mailto:hola@ejemplo.test"');
    expect(textoPlano(h)).toContain('De lunes a viernes, de 9 a 19 h');
  });

  it('lleva el formulario, «Qué pasa después» y la retención de config', () => {
    expect(html).toContain('name="telefono"');
    expect(html).toContain('id="enviar-peticion"');
    expect(texto).toContain('Qué pasa después');
    expect(texto).toContain('Te respondemos lo antes posible');
    expect(texto).toContain('Presupuesto gratuito y sin compromiso');
    expect(texto).toContain('Guardamos tu foto 90 días');
    expect(textoPlano(pinta(negocio, { ...config, retencion_dias: 30 }))).toContain('Guardamos tu foto 30 días');
  });

  it('el único primario es «Enviar petición»', () => {
    expect(html.match(/data-variant="primary"/g)).toHaveLength(1);
    expect(html).toMatch(/data-variant="primary"[^>]*id="enviar-peticion"/);
  });

  it('sin style= propios ni hex', () => {
    expect(sinEstiloAstryx(html)).not.toContain('style=');
    expect(html).not.toContain('<style');
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('lleva la CintaEtiqueta antes del H1', () => {
    const cintas = [...html.matchAll(/<p[^>]*class="[^"]*cinta-etiqueta[^"]*"[^>]*>([^<]*)<\/p>/g)];
    expect(cintas).toHaveLength(1);
    const textoCinta = cintas[0][1].trim();
    expect(textoCinta.length).toBeGreaterThan(0);
    expect(textoCinta).toBe(textoCinta.toUpperCase());
    expect(cintas[0].index).toBeLessThan(html.indexOf('<h1'));
  });

  it('tres vías en tarjetas (WhatsApp, Llamar, Formulario)', () => {
    const t = tarjetas(html);
    expect(t).toHaveLength(3);
    const titulo = (c: string) =>
      c
        .match(/<h[23][^>]*>((?:(?!<\/h[23]>).)*)<\/h[23]>/s)?.[1]
        .replace(/<[^>]+>/g, '')
        .trim();
    expect(t.map(titulo)).toEqual(['WhatsApp', 'Llamar', 'Formulario']);
    const [wa, llamar, form] = t;
    expect(wa).toContain('href="https://wa.me/34600000000?text=');
    expect(textoPlano(wa)).toMatch(/Manda la foto del daño/);
    expect(llamar).toContain('href="tel:+34600000000"');
    expect(form).toMatch(/href="#(contacto-formulario|enviar-peticion)"/);
    expect(textoPlano(form)).toMatch(/Cuéntanos qué le pasa/);
    expect(html).toMatch(/<ul[^>]*>\s*<li[^>]*>\s*<div class="astryx-card/);
  });

  it('sin teléfono ni WhatsApp solo queda la tarjeta del formulario', () => {
    const sinVias: Negocio = structuredClone(negocio);
    sinVias.telefono = { ...sinVias.telefono, valor: '' };
    sinVias.whatsapp = { ...sinVias.whatsapp, valor: '' };
    const t = tarjetas(pinta(sinVias));
    expect(t).toHaveLength(1);
    expect(textoPlano(t[0])).toMatch(/Formulario/);
  });

  it('el subtítulo no es type large', () => {
    const frase = 'Llámanos, escríbenos por WhatsApp o rellena el formulario.';
    const tipo = tipoDe(html, frase);
    expect(tipo).toBeDefined();
    const referencia = tipoDe(renderToStaticMarkup(<Text type="large" as="p">{frase}</Text>), frase);
    expect(referencia).toBe('large');
    expect(tipo).not.toBe(referencia);
  });

  it('metadatos propios', () => {
    const metadata = generateMetadata();
    expect(String(metadata.title)).toMatch(/Contacto/);
    expect(String(metadata.description)).toMatch(/foto/);
    expect(metadata.alternates?.canonical).toBe(canonicalUrl(cargarNegocio().url_base, '/contacto/'));
  });
});
