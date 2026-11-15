import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { APP_NAME, NAV } from '../config';
import { configFormulario } from '../lib/config';
import { cargarNegocio, type Negocio } from '../lib/content';
import { DESCRIPTION } from '../lib/site';
import { telLink } from '../lib/whatsapp';
import { Frame } from '../ui/Frame';
import NotFound from './not-found';
import { Portada } from './page';

const negocio = cargarNegocio();
const config = configFormulario({});
const llamar = { href: telLink(negocio.telefono.valor!), etiqueta: 'Llamar' };

const pinta = (n: Negocio, c = config) =>
  renderToStaticMarkup(
    <Frame brand={APP_NAME} nav={NAV} llamar={llamar}>
      <Portada negocio={n} config={c} modo="publico" />
    </Frame>,
  );

const h1 = (html: string) => /<h1[^>]*>((?:(?!<\/h1>).)*)<\/h1>/s.exec(html)?.[1].replace(/<[^>]+>/g, '') ?? '';
const textoPlano = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const confirmado: Negocio = structuredClone(negocio);
confirmado.plazos.reparacion = { valor: 'en unas horas', confirmado: true };
confirmado.garantia.anios = { valor: 2, confirmado: true };
confirmado.anios = { valor: 15, confirmado: true };

describe('portada con contenido sin confirmar (modo público)', () => {
  const html = pinta(negocio);
  const texto = textoPlano(html);

  it('tiene un solo H1 de beneficio dentro del marco de Astryx', () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(h1(html)).toMatch(/plato de ducha se repara/);
    expect(h1(html)).toMatch(/[Ss]in obras/);
    expect(h1(html)).toMatch(/garantía/);
    expect(h1(html)).not.toMatch(/en unas horas|en el día/);
    expect(html).toContain(APP_NAME);
    expect(html).toContain(DESCRIPTION);
    expect(html).toMatch(/<main[\s>]|role="main"/);
  });

  it('lleva la cinta del hero y la ilustración del plato partido', () => {
    expect(texto).toContain('MADRID · PLATOS DE DUCHA, BAÑERAS Y AZULEJOS');
    expect(html).toMatch(/<svg[^>]*role="img"[^>]*aria-label="Ilustración: plato de ducha/);
  });

  it('enlaza a WhatsApp y al teléfono del fichero de contacto', () => {
    expect(html).toMatch(/href="https:\/\/wa\.me\/34600000000\?text=[^"]+"/);
    expect(html).toContain('Manda la foto por WhatsApp');
    expect(html).toContain('href="tel:+34600000000"');
    expect(html.match(/href="tel:\+34/g)!.length).toBeGreaterThanOrEqual(2); // cabecera + hero
  });

  it('franja de confianza: garantía sin plazo, sin obras y hoteles; sin años', () => {
    expect(texto).toContain('Garantía por escrito');
    expect(texto).not.toMatch(/Garantía por escrito de/);
    expect(texto).toContain('Sin obras ni polvo');
    expect(texto).toMatch(/hoteles/i);
    expect(texto).not.toMatch(/PENDIENTE|\{\{|\b0 años|años reparando/);
  });

  it('dos primarios, excepción aceptada solo en la portada: WhatsApp del hero y el submit del formulario', () => {
    // brain/design.md pide uno por pantalla; la spec acepta estos dos porque el formulario va al final y el
    // botón flotante se oculta mientras se ve cualquiera de los dos.
    const primarios = [...html.matchAll(/<(a|button)\b[^>]*data-variant="primary"[^>]*>/g)].map((m) => m[0]);
    expect(primarios).toHaveLength(2);
    expect(primarios[0]).toMatch(/href="https:\/\/wa\.me\//);
    expect(primarios[1]).toMatch(/type="submit"/);
    expect(primarios[1]).toContain('id="enviar-peticion"');
    expect(texto).toContain('Tu foto solo la vemos nosotros y se borra a los 90 días');
    const otra = textoPlano(pinta(negocio, { ...config, retencion_dias: 30 }));
    expect(otra).toContain('se borra a los 30 días');
  });

  it('el formulario va al final, después del CTA del hero, con su H2', () => {
    const cta = html.indexOf('Manda la foto por WhatsApp');
    const form = html.indexOf('name="telefono"');
    expect(cta).toBeGreaterThan(-1);
    expect(form).toBeGreaterThan(cta);
    expect(form).toBeGreaterThan(html.indexOf('Sin obras ni polvo'));
    expect(html).toMatch(/<h2[^>]*>(?:(?!<\/h2>).)*Mándanos una foto(?:(?!<\/h2>).)*<\/h2>/s);
    expect(texto).toContain('Guardamos tu foto 90 días');
  });

  it('sin estilos sueltos ni hex', () => {
    expect(html).not.toContain('<style');
    // El CheckboxInput de Astryx pinta este estilo en línea (StyleX, centrado del input); no es nuestro.
    expect(html.replaceAll('style="--x-transform:translate(-50%, -50%)"', '')).not.toContain('style=');
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('todo el contenido, franja incluida, va dentro del contenedor con margen lateral `portada`', () => {
    const portada = renderToStaticMarkup(<Portada negocio={negocio} config={config} modo="publico" />);
    expect(portada).toMatch(/^<[a-z]+ [^>]*class="[^"]*\bportada\b[^"]*"/);
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
    const regla = /\.portada\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(regla).toMatch(/padding-inline:\s*var\(--spacing-\d+\)/);
    expect(regla).toMatch(/max-inline-size:\s*var\(--measure\)/);
    expect(regla).toMatch(/margin-inline:\s*auto/);
    for (const decl of regla.split(';').map((d) => d.trim()).filter(Boolean)) {
      expect(decl).toMatch(/^[a-z-]+:\s*(var\(--[a-z0-9-]+\)|auto|100%|border-box)$/);
    }
  });

  it('no lleva enlaces a endpoints JSON y mantiene la navegación', () => {
    const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
    for (const href of hrefs) expect(href).not.toMatch(/^\/(health|api)(\/|$|\?|#)/);
    expect(html).toMatch(/<nav[^>]*aria-label="[^"]+"/);
    for (const item of NAV) expect(html).toContain(`href="${item.href}"`);
  });
});

describe('portada con plazos, garantía y años confirmados', () => {
  it('cambia el H1 y la franja sin tocar componentes', () => {
    const antes = pinta(negocio);
    const html = pinta(confirmado);
    const texto = textoPlano(html);
    expect(h1(html)).not.toBe(h1(antes));
    expect(h1(html)).toContain('en unas horas');
    expect(texto).toContain('Garantía por escrito de 2 años');
    expect(texto).toContain('15 años reparando baños');
    expect(texto).not.toMatch(/PENDIENTE|\{\{/);
  });
});

describe('marco', () => {
  it('sin `llamar` no pinta el botón de la cabecera', () => {
    const html = renderToStaticMarkup(<Frame brand={APP_NAME} nav={NAV}><p>x</p></Frame>);
    expect(html).not.toContain('tel:');
  });

  it('con `llamar` pinta un botón secundario con enlace tel: en la cabecera', () => {
    const html = renderToStaticMarkup(<Frame brand={APP_NAME} nav={NAV} llamar={llamar}><p>x</p></Frame>);
    expect(html).toMatch(/<a[^>]*data-variant="secondary"[^>]*href="tel:\+34600000000"/);
    expect(html).toContain('Llamar');
  });
});

describe('botón flotante en globals.css', () => {
  const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
  const regla = (sel: string) => new RegExp(`\\${sel}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? '';
  const decls = (r: string) => r.split(';').map((d) => d.trim()).filter(Boolean);

  it('.boton-flotante: fijo abajo a la derecha, píldora y --shadow-1, solo con var(--…) o palabras clave', () => {
    const r = regla('.boton-flotante');
    expect(r).toMatch(/box-shadow:\s*var\(--shadow-1\)/);
    expect(r).toMatch(/position:\s*fixed/);
    expect(r).toMatch(/inset-block-end:\s*var\(--spacing-\d+\)/);
    expect(r).toMatch(/inset-inline-end:\s*var\(--spacing-\d+\)/);
    expect(r).toMatch(/border-radius:\s*var\(--radius-full\)/);
    for (const d of decls(r)) expect(d).toMatch(/^[a-z-]+:\s*(var\(--[a-z0-9-]+\)|[a-z-]+)$/);
  });

  it('.boton-flotante-oculto lo esconde sin valores sueltos', () => {
    const r = regla('.boton-flotante-oculto');
    expect(r).toMatch(/visibility:\s*hidden/);
    for (const d of decls(r)) expect(d).toMatch(/^[a-z-]+:\s*(var\(--[a-z0-9-]+\)|[a-z-]+)$/);
  });
});

describe('hero', () => {
  it('los botones del hero llevan id="cta-hero" (el flotante se oculta mientras se ven)', () => {
    const html = renderToStaticMarkup(<Portada negocio={negocio} config={config} modo="publico" />);
    expect(html).toMatch(/id="cta-hero"[^>]*>(?:(?!<\/section>).)*Manda la foto por WhatsApp/s);
  });
});

describe('404', () => {
  it('explica el error y lleva a la portada', () => {
    const html = renderToStaticMarkup(<NotFound />);
    expect(html).toMatch(/<h1[^>]*>(?:(?!<\/h1>).)*No encontramos esta página/s);
    expect(html).toContain('href="/"');
  });
});

describe('layout', () => {
  const src = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
  it('importa solo globals.css', () => {
    expect(src).toContain("import './globals.css'");
    expect(src).not.toMatch(/theme\.css|base\.css/);
  });
  it('monta el botón flotante de WhatsApp una sola vez', () => {
    expect(src.match(/import \{ BotonFlotanteWhatsApp \} from '\.\.\/ui\/BotonFlotanteWhatsApp'/g)).toHaveLength(1);
    expect(src.match(/<BotonFlotanteWhatsApp\b/g)).toHaveLength(1);
  });
  it('pasa a Frame el teléfono del contenido con telLink', () => {
    expect(src).toMatch(/telLink\(/);
    expect(src).toMatch(/cargarNegocio\(/);
    expect(src).toMatch(/llamar=/);
  });
});
