import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { filasComparativa, resolverPasos } from '../lib/catalogo';
import { cargarComparativa, cargarNegocio, cargarPasos, cargarServicios } from '../lib/content';
import { rutaGenerada } from '../lib/paginas';
import { BotonWhatsApp } from './BotonWhatsApp';
import { ListaZonas } from './ListaZonas';
import { PasosTrabajo } from './PasosTrabajo';
import { PrecioDesde } from './PrecioDesde';
import { TablaRepararCambiar } from './TablaRepararCambiar';
import { TarjetaServicio } from './TarjetaServicio';

const servicios = cargarServicios();
const plato = servicios.find((s) => s.tipo === 'principal')!;
const azulejos = servicios.find((s) => s.slug === 'azulejos')!;

const textoPlano = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
/**
 * Estilos en línea que no son el del contenedor de scroll de Table de Astryx, que siempre pinta
 * `style="--x-overflowX:clip;--x-overflowY:clip;overscroll-behavior-x:auto"` (no lo escribe nuestro código).
 */
const estilosEnLinea = (html: string) =>
  [...html.matchAll(/<[^>]*\bstyle="([^"]*)"[^>]*>/g)].filter(
    ([tag, decl]) =>
      !(
        /class="astryx-table-scroll-wrapper\b/.test(tag) &&
        decl.split(';').every((d) => /^(--x-overflow[XY]:clip|overscroll-behavior-[xy]:auto)$/.test(d))
      ),
  );
const sinEstilos = (html: string) => {
  expect(estilosEnLinea(html).map((m) => m[0])).toEqual([]);
  expect(html).not.toContain('<style');
};

describe('TarjetaServicio', () => {
  const grande = renderToStaticMarkup(<TarjetaServicio servicio={plato} enlazar />);
  const compacta = renderToStaticMarkup(<TarjetaServicio servicio={azulejos} enlazar />);
  const grandeSin = renderToStaticMarkup(<TarjetaServicio servicio={plato} enlazar={false} />);
  const compactaSin = renderToStaticMarkup(<TarjetaServicio servicio={azulejos} enlazar={false} />);

  it('con enlace, la del plato enlaza a su página, lleva el nombre en H3 y se marca como grande', () => {
    expect(grande).toContain('href="/platos-de-ducha/"');
    expect(grande).toMatch(/<h3[^>]*>(?:(?!<\/h3>).)*Reparación y esmaltado de platos de ducha/s);
    expect(textoPlano(grande)).toContain(plato.resumen);
    expect(grande).toContain('data-tamano="grande"');
    expect(grande).not.toContain('data-tamano="compacta"');
    sinEstilos(grande);
  });

  it('con enlace, las demás son compactas y enlazan a su ruta', () => {
    expect(compacta).toContain('href="/servicios/azulejos/"');
    expect(compacta).toContain('data-tamano="compacta"');
    expect(compacta).not.toContain('data-tamano="grande"');
    expect(compacta).toMatch(/<h3[^>]*>(?:(?!<\/h3>).)*Esmaltado de azulejos/s);
    expect(textoPlano(compacta)).toContain(azulejos.resumen);
    sinEstilos(compacta);
  });

  it('sin enlace no hay href ni <a>, y se conservan H3, resumen y tamaño', () => {
    for (const [html, s, tamano] of [
      [grandeSin, plato, 'grande'],
      [compactaSin, azulejos, 'compacta'],
    ] as const) {
      expect(html).not.toContain('href=');
      expect(html).not.toContain('<a');
      expect(html).not.toContain('astryx-clickable-card');
      expect(html).toMatch(new RegExp(`<h3[^>]*>(?:(?!<\\/h3>).)*${s.nombre}`, 's'));
      expect(textoPlano(html)).toContain(s.resumen);
      expect(html).toContain(`data-tamano="${tamano}"`);
      sinEstilos(html);
    }
  });

  it('sin la prop, enlaza solo si el build genera la página de su ruta', () => {
    for (const s of [plato, azulejos]) {
      const html = renderToStaticMarkup(<TarjetaServicio servicio={s} />);
      expect(html.includes(`href="${s.ruta}"`)).toBe(rutaGenerada(s.ruta));
    }
    // Hoy no existen /platos-de-ducha/ ni /servicios/*: ninguna de las dos enlaza.
    expect(renderToStaticMarkup(<TarjetaServicio servicio={plato} />)).not.toContain('href=');
    expect(renderToStaticMarkup(<TarjetaServicio servicio={azulejos} />)).not.toContain('href=');
  });

  it('no muestra precio', () => {
    expect(grande).not.toMatch(/€|Desde|presupuesto/i);
    expect(grandeSin).not.toMatch(/€|Desde|presupuesto/i);
  });
});

describe('PrecioDesde', () => {
  it('con precio confirmado pinta «Desde X €» en mono', () => {
    const html = renderToStaticMarkup(<PrecioDesde dato={{ valor: 90, confirmado: true }} modo="publico" />);
    expect(html).toMatch(/data-type="code"[^>]*>Desde 90 €</);
  });

  it('sin confirmar dice «Pide presupuesto gratuito» en texto normal', () => {
    const html = renderToStaticMarkup(<PrecioDesde dato={{ valor: null, confirmado: false }} modo="publico" />);
    expect(textoPlano(html)).toContain('Pide presupuesto gratuito');
    expect(html).not.toContain('data-type="code"');
  });

  it('nunca pinta «0»', () => {
    const html = renderToStaticMarkup(<PrecioDesde dato={{ valor: 0, confirmado: true }} modo="publico" />);
    expect(textoPlano(html)).not.toMatch(/\b0\b/);
    expect(textoPlano(html)).toContain('Pide presupuesto gratuito');
  });
});

describe('BotonWhatsApp', () => {
  const props = { numero: '+34 600 000 000', mensaje: 'Hola', etiqueta: 'Escríbenos' };
  it('por defecto es primario', () => {
    expect(renderToStaticMarkup(<BotonWhatsApp {...props} />)).toContain('data-variant="primary"');
  });
  it('con variante secondary es secundario', () => {
    const html = renderToStaticMarkup(<BotonWhatsApp {...props} variante="secondary" />);
    expect(html).toContain('data-variant="secondary"');
    expect(html).not.toContain('data-variant="primary"');
    expect(html).toContain('href="https://wa.me/');
  });
});

const negocio = cargarNegocio();
const pasos = cargarPasos();
const comparativa = cargarComparativa();

describe('PasosTrabajo', () => {
  const html = renderToStaticMarkup(
    <PasosTrabajo pasos={resolverPasos(pasos, negocio, 'publico')} whatsapp="+34 600 000 000" mensaje="Hola, os mando una foto" />,
  );
  const items = [...html.matchAll(/<li\b[^>]*>((?:(?!<\/li>).)*)<\/li>/gs)].map((m) => m[1]);

  it('pinta los 4 pasos en una lista ordenada con «PASO N» en la cinta', () => {
    expect(html).toMatch(/^<ol\b/);
    expect(items).toHaveLength(4);
    items.forEach((li, i) => {
      expect(li).toMatch(new RegExp(`class="[^"]*\\bpaso-numero\\b[^"]*"[^>]*>PASO ${i + 1}<`));
    });
    expect(textoPlano(items[1])).toContain('Presupuesto gratuito y sin compromiso');
  });

  it('solo el paso 1 lleva el botón de WhatsApp, y es secundario', () => {
    expect(items[0]).toMatch(/href="https:\/\/wa\.me\//);
    expect(items[0]).toContain('data-variant="secondary"');
    for (const li of items.slice(1)) expect(li).not.toContain('wa.me');
    expect(html).not.toContain('data-variant="primary"');
    sinEstilos(html);
  });

  it('sin número de WhatsApp no pinta el botón', () => {
    const sin = renderToStaticMarkup(<PasosTrabajo pasos={resolverPasos(pasos, negocio, 'publico')} whatsapp={null} mensaje="Hola" />);
    expect(sin).not.toContain('wa.me');
    expect(sin.match(/<li\b/g)).toHaveLength(4);
  });
});

describe('TablaRepararCambiar', () => {
  const cabeceras = (html: string) =>
    [...html.matchAll(/<tr\b[^>]*>((?:(?!<\/tr>).)*)<\/tr>/gs)].map((m) => (m[1].match(/<th\b/g) ?? []).length).filter((n) => n > 0);

  it('sin cifras confirmadas compara solo tiempo y obra, sin coste ni fuente', () => {
    const filas = filasComparativa(comparativa, 'publico');
    const html = renderToStaticMarkup(<TablaRepararCambiar filas={filas} fuente={comparativa.fuente} conCoste={false} />);
    const texto = textoPlano(html);
    expect(html).toMatch(/<table\b/);
    expect(texto).not.toContain('Coste');
    expect(texto).not.toContain('€');
    expect(texto).not.toContain(comparativa.fuente);
    expect(html).toMatch(/<th\b[^>]*class="[^"]*\btabla-cabecera-reparar\b[^"]*"[^>]*>(?:(?!<\/th>).)*Reparar/s);
    expect(texto).toContain('Cambiar');
    for (const n of cabeceras(html)) expect(n).toBeLessThanOrEqual(3);
    for (const f of filas) {
      expect(texto).toContain(f.reparar);
      expect(texto).toContain(f.cambiar);
    }
    sinEstilos(html);
  });

  it('ninguna celda de cabecera queda vacía y la primera es «Concepto»', () => {
    const html = renderToStaticMarkup(
      <TablaRepararCambiar filas={filasComparativa(comparativa, 'publico')} fuente={comparativa.fuente} conCoste={false} />,
    );
    const ths = [...html.matchAll(/<th\b[^>]*>((?:(?!<\/th>).)*)<\/th>/gs)].map((m) => textoPlano(m[1]).trim());
    expect(ths.length).toBeGreaterThan(0);
    for (const t of ths) expect(t).not.toBe('');
    expect(ths[0]).toContain('Concepto');
  });

  it('con el coste confirmado muestra la cifra en mono y la fuente', () => {
    const c = structuredClone(comparativa);
    c.filas[0].reparar = { valor: 'Desde 150 €', confirmado: true };
    c.filas[0].cambiar = { valor: '865-1.200 €', confirmado: true };
    const filas = filasComparativa(c, 'publico');
    const html = renderToStaticMarkup(<TablaRepararCambiar filas={filas} fuente={c.fuente} conCoste />);
    expect(html).toMatch(/data-type="code"[^>]*>865-1\.200 €</);
    expect(textoPlano(html)).toContain('Coste');
    expect(textoPlano(html)).toContain(c.fuente);
  });
});

describe('ListaZonas', () => {
  const zonas = { madrid_capital: ['Centro', 'Retiro', 'Usera'], municipios: ['Getafe', 'Coslada'] };
  const html = renderToStaticMarkup(<ListaZonas zonas={zonas} />);

  it('pinta los anillos y dos grupos con H3 y todas las zonas en listas', () => {
    const texto = textoPlano(html);
    expect(html).toMatch(/<svg[^>]*aria-label="Esquema: Madrid capital/);
    expect(html).toMatch(/<h3[^>]*>(?:(?!<\/h3>).)*Madrid capital/s);
    expect(html).toMatch(/<h3[^>]*>(?:(?!<\/h3>).)*Municipios del área metropolitana/s);
    expect(html.match(/<ul\b/g)).toHaveLength(2);
    expect(html.match(/<li\b/g)).toHaveLength(5);
    for (const z of [...zonas.madrid_capital, ...zonas.municipios]) expect(texto).toContain(z);
  });

  it('sin Badge, sin CTA y sin estilos sueltos', () => {
    expect(html).not.toContain('astryx-badge');
    expect(html).not.toContain('wa.me');
    sinEstilos(html);
  });
});
