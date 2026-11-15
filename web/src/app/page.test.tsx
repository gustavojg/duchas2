import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { APP_NAME, NAV } from '../config';
import { configFormulario } from '../lib/config';
import { cargarFaq, cargarGaleria, cargarNegocio, type Negocio, type Resena } from '../lib/content';
import { DESCRIPTION } from '../lib/site';
import { telLink } from '../lib/whatsapp';
import { Frame } from '../ui/Frame';
import NotFound from './not-found';
import { Portada } from './page';

const negocio = cargarNegocio();
const config = configFormulario({});
const llamar = { href: telLink(negocio.telefono.valor!), etiqueta: 'Llamar' };

const galeria = cargarGaleria();
const faq = cargarFaq();

const pinta = (n: Negocio, c = config, resenas: Resena[] = []) =>
  renderToStaticMarkup(
    <Frame brand={APP_NAME} nav={NAV} llamar={llamar}>
      <Portada negocio={n} config={c} modo="publico" galeria={galeria} faq={faq} resenas={resenas} />
    </Frame>,
  );

/** Astryx (AspectRatio, Slider) pinta variables CSS internas en `style`; eso no es estilo propio. */
const sinVariablesAstryx = (html: string) => html.replace(/ style="(?:--[\w-]+:[\w.\s-]+;?)+"/g, '');
const sinScripts = (html: string) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
const jsonLd = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

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

  it('un solo botón primario (WhatsApp) y la retención con el número de config', () => {
    expect(html.match(/data-variant="primary"/g)).toHaveLength(1);
    expect(html).toMatch(/data-variant="primary"[^>]*href="https:\/\/wa\.me\//);
    expect(texto).toContain('Tu foto solo la vemos nosotros y se borra a los 90 días');
    const otra = textoPlano(pinta(negocio, { ...config, retencion_dias: 30 }));
    expect(otra).toContain('se borra a los 30 días');
  });

  it('sin estilos sueltos ni hex (fuera del JSON-LD y de las variables internas de Astryx)', () => {
    expect(html).not.toContain('<style');
    expect(sinVariablesAstryx(html)).not.toContain('style=');
    expect(sinScripts(html)).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('todo el contenido, franja incluida, va dentro del contenedor con margen lateral `portada`', () => {
    const portada = renderToStaticMarkup(
      <Portada negocio={negocio} config={config} modo="publico" galeria={galeria} faq={faq} resenas={[]} />,
    );
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

describe('portada: antes/después, reseñas, FAQ resumida y JSON-LD', () => {
  const html = pinta(negocio);
  const texto = textoPlano(html);

  it('la FAQ resumida tiene entre 4 y 6 desplegables con las preguntas en_portada', () => {
    const seccion = /<section[^>]*aria-labelledby="portada-faq-titulo"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';
    expect(seccion).not.toBe('');
    const enPortada = faq.temas.flatMap((t) => t.preguntas).filter((q) => q.en_portada);
    const botones = [...seccion.matchAll(/<button[^>]*aria-expanded="false"[^>]*>([\s\S]*?)<\/button>/g)].map((m) =>
      textoPlano(m[1]).trim(),
    );
    expect(botones.length).toBeGreaterThanOrEqual(4);
    expect(botones.length).toBeLessThanOrEqual(6);
    expect(botones).toHaveLength(enPortada.length);
    for (const q of enPortada) expect(botones).toContain(q.p);
  });

  it('enlaza a todas las preguntas y a todos los trabajos', () => {
    expect(html).toContain('href="/preguntas-frecuentes/"');
    expect(html).toContain('href="/antes-y-despues/"');
    expect(texto).toContain('Todas las preguntas');
    expect(texto).toContain('Ver todos los trabajos');
    expect(texto).toContain('Manda la foto del tuyo');
  });

  it('el antes/después muestra el deslizador y las ilustraciones rotuladas', () => {
    expect(texto.split('Pronto, fotos reales de este trabajo')).toHaveLength(2);
    expect(html).toMatch(/role="slider"[^>]*aria-valuenow="50"/);
    expect(texto).toContain('ANTES');
    expect(texto).toContain('DESPUÉS');
  });

  it('las miniaturas van en fila y compactas', () => {
    const seccion = /<section[^>]*aria-labelledby="portada-antes-despues-titulo"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';
    expect(seccion).not.toBe('');
    const fila = /<ul[^>]*data-direction="horizontal"[^>]*>([\s\S]*?)<\/ul>/.exec(seccion)?.[1] ?? '';
    expect(fila.match(/<li[^>]*class="[^"]*portada-miniatura[^"]*"/g)).toHaveLength(3);
    expect(fila.match(/ILUSTRACIÓN/g)).toHaveLength(3);
    expect(fila).not.toContain('Pronto, fotos reales de este trabajo');
  });

  it('sin reseñas: ni bloque ni AggregateRating, pero sí LocalBusiness', () => {
    expect(texto).not.toContain('Lo que dicen de nosotros');
    expect(html).not.toMatch(/aggregateRating|AggregateRating/);
    expect(html).toContain('"@type":"LocalBusiness"');
  });

  it('con reseñas, la nota visible coincide con ratingValue del JSON-LD', () => {
    const r = (nota: number, i: number): Resena => ({
      autor: `Cliente ${i}`,
      nota,
      texto: 'Muy buen trabajo',
      fecha: `2026-01-0${i}`,
      fuente: 'Google',
    });
    const conResenas = pinta(negocio, config, [r(5, 1), r(5, 2), r(4, 3)]);
    expect(textoPlano(conResenas)).toContain('Lo que dicen de nosotros');
    expect(textoPlano(conResenas)).toContain('4,7 / 5');
    const local = jsonLd(conResenas).find((d) => d['@type'] === 'LocalBusiness');
    expect(local.aggregateRating.ratingValue).toBe(4.7);
    expect(local.aggregateRating.reviewCount).toBe(3);
  });

  it('sigue habiendo un solo botón primario y un solo H1', () => {
    expect(html.match(/data-variant="primary"/g)).toHaveLength(1);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
  });

  it('los botones del hero van antes de la ilustración y del antes/después', () => {
    const wa = html.indexOf('Manda la foto por WhatsApp');
    expect(wa).toBeGreaterThan(-1);
    expect(wa).toBeLessThan(html.indexOf('aria-label="Ilustración: plato de ducha'));
    expect(wa).toBeLessThan(html.indexOf('role="slider"'));
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
  it('pasa a Frame el teléfono del contenido con telLink', () => {
    expect(src).toMatch(/telLink\(/);
    expect(src).toMatch(/cargarNegocio\(/);
    expect(src).toMatch(/llamar=/);
  });
});
