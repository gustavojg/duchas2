import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { MENSAJE_PORTADA } from '../lib/whatsapp';
import { BotonFlotanteWhatsApp } from './BotonFlotanteWhatsApp';

const nav = vi.hoisted(() => ({ ruta: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.ruta }));

const pinta = (ruta: string, servicios?: { ruta: string; whatsapp_mensaje: string }[]) => {
  nav.ruta = ruta;
  return renderToStaticMarkup(<BotonFlotanteWhatsApp numero="+34 600 000 000" servicios={servicios} />);
};
const href = (html: string) => /href="([^"]+)"/.exec(html)?.[1].replace(/&amp;/g, '&') ?? '';

describe('BotonFlotanteWhatsApp', () => {
  it('en / lleva el mensaje de la portada codificado en un enlace wa.me con el número', () => {
    const html = pinta('/');
    expect(href(html)).toBe(`https://wa.me/34600000000?text=${encodeURIComponent(MENSAJE_PORTADA)}`);
  });

  it('en /servicios/x/ el mensaje es otro', () => {
    const portada = href(pinta('/'));
    const servicio = href(pinta('/servicios/x/'));
    expect(servicio).toMatch(/^https:\/\/wa\.me\/34600000000\?text=/);
    expect(servicio).not.toBe(portada);
  });

  it('usa el whatsapp_mensaje de los servicios que recibe', () => {
    const html = pinta('/servicios/x/', [{ ruta: '/servicios/x/', whatsapp_mensaje: 'Hola, servicio x' }]);
    expect(href(html)).toContain(encodeURIComponent('Hola, servicio x'));
  });

  it('es un botón primario con la clase boton-flotante, etiqueta «WhatsApp» y glifo; visible al pintarse', () => {
    const html = pinta('/');
    expect(html).toMatch(/<a [^>]*class="[^"]*\bboton-flotante\b/);
    expect(html).toContain('data-variant="primary"');
    expect(html).toContain('>WhatsApp<');
    expect(html).toContain('<svg');
    expect(html).not.toContain('boton-flotante-oculto');
    expect(html).not.toContain('aria-hidden="true" tabindex');
    expect(html).not.toContain('style=');
  });
});
