import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { configFormulario } from '../../lib/config';
import { cargarNegocio, type Negocio } from '../../lib/content';
import { Contacto, metadata } from './page';

const negocio = cargarNegocio();
const config = configFormulario({});
const pinta = (n: Negocio = negocio, c = config) => renderToStaticMarkup(<Contacto negocio={n} config={c} modo="publico" />);
const textoPlano = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const h1s = (html: string) => [...html.matchAll(/<h1[^>]*>((?:(?!<\/h1>).)*)<\/h1>/gs)].map((m) => m[1].replace(/<[^>]+>/g, ''));
/** El CheckboxInput de Astryx pinta este estilo en línea (centrado del input, StyleX); no es nuestro. */
const sinEstiloAstryx = (html: string) => html.replaceAll('style="--x-transform:translate(-50%, -50%)"', '');

const conDatos: Negocio = structuredClone(negocio);
conDatos.email = { valor: 'hola@ejemplo.test', confirmado: true };
conDatos.horario = { valor: 'De lunes a viernes, de 9 a 19 h', confirmado: true };

describe('/contacto/', () => {
  const html = pinta();
  const texto = textoPlano(html);

  it('metadata lleva su canonical: url_base + /contacto/', () => {
    expect(metadata.alternates?.canonical).toBe(`${negocio.url_base.replace(/\/+$/, '')}/contacto/`);
  });

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

  it('metadatos propios', () => {
    expect(String(metadata.title)).toMatch(/Contacto/);
    expect(String(metadata.description)).toMatch(/foto/);
  });
});
