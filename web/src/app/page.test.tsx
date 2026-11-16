import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { APP_NAME, NAV } from '../config';
import { configFormulario } from '../lib/config';
import {
  cargarComparativa,
  cargarFaq,
  cargarGaleria,
  cargarNegocio,
  cargarPasos,
  cargarServicios,
  cargarZonas,
  type Comparativa,
  type Negocio,
  type Resena,
  type Servicio,
} from '../lib/content';
import { rutaGenerada } from '../lib/paginas';
import { DESCRIPTION, PAGES } from '../lib/site';
import { telLink } from '../lib/whatsapp';
import { FranjaConfianza } from '../ui/FranjaConfianza';
import { Frame } from '../ui/Frame';
import NotFound from './not-found';
import { generateMetadata as metadataDeAntesYDespues } from './antes-y-despues/page';
import { generateMetadata as metadataDeContacto } from './contacto/page';
import { generateMetadata as metadataDePortada, Portada, type PortadaProps } from './page';
import { generateMetadata as metadataDePlatos } from './platos-de-ducha/page';
import { generateMetadata as metadataDeFaq } from './preguntas-frecuentes/page';
import { generateMetadata as metadataDePrivacidad } from './privacidad/page';
import { generateMetadata as metadataDeTarifas } from './tarifas/page';
import { generateMetadata as metadataDeZonas, Zonas } from './zonas/page';

const negocio = cargarNegocio();
const config = configFormulario({});
const servicios = cargarServicios();
const pasos = cargarPasos();
const comparativa = cargarComparativa();
const zonas = cargarZonas();
const llamar = { href: telLink(negocio.telefono.valor!), etiqueta: 'Llamar' };

const galeria = cargarGaleria();
const faq = cargarFaq();
const sinResenas: Resena[] = [];
const contenido = { servicios, pasos, comparativa, zonas, galeria, faq, resenas: sinResenas };
type Contenido = Partial<Omit<PortadaProps, 'negocio' | 'config' | 'modo'>>;

const pinta = (n: Negocio, c = config, otro: Contenido = {}) =>
  renderToStaticMarkup(
    <Frame brand={APP_NAME} nav={NAV} llamar={llamar}>
      <Portada negocio={n} config={c} modo="publico" {...contenido} {...otro} />
    </Frame>,
  );

/**
 * Estilos en línea que no son el del contenedor de scroll de Table de Astryx, que siempre pinta
 * `style="--x-overflowX:clip;--x-overflowY:clip;overscroll-behavior-x:auto"` (no lo escribe nuestro código).
 */
const estilosEnLinea = (html: string) =>
  [...html.matchAll(/<[^>]*\bstyle="([^"]*)"[^>]*>/g)]
    .filter(
      ([tag, decl]) =>
        !(
          /class="astryx-table-scroll-wrapper\b/.test(tag) &&
          decl.split(';').every((d) => /^(--x-overflow[XY]:clip|overscroll-behavior-[xy]:auto)$/.test(d))
        ),
    )
    // CheckboxInput de Astryx (casilla de privacidad del formulario): centrado del input en línea, no es nuestro.
    .filter(([, decl]) => decl !== '--x-transform:translate(-50%, -50%)')
    .map((m) => m[0]);

/** Astryx (AspectRatio, Slider) pinta variables CSS internas en `style`; eso no es estilo propio. */
const sinVariablesAstryx = (html: string) => html.replace(/ style="(?:--[\w-]+:[\w.\s-]+;?)+"/g, '');
const sinScripts = (html: string) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
const jsonLd = (html: string) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

const h1 = (html: string) => /<h1[^>]*>((?:(?!<\/h1>).)*)<\/h1>/s.exec(html)?.[1].replace(/<[^>]+>/g, '') ?? '';
const ulFranja = (html: string) => /<ul[^>]*aria-label="Nuestros compromisos"[^>]*>((?:(?!<\/ul>).)*)<\/ul>/s.exec(html)?.[1] ?? '';
const franja = (html: string) =>
  [...ulFranja(html).matchAll(/<li[\s>](?:(?!<\/li>).)*<\/li>/gs)].map((m) => m[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
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
    // El hero conserva la cinta vertical del plato partido, antes del deslizador.
    expect(html).toContain('ANTES · DESPUÉS');
    expect(html.indexOf('ANTES · DESPUÉS')).toBeLessThan(html.indexOf('role="slider"'));
  });

  it('enlaza a WhatsApp y al teléfono del fichero de contacto', () => {
    expect(html).toMatch(/href="https:\/\/wa\.me\/34600000000\?text=[^"]+"/);
    expect(html).toContain('Manda la foto por WhatsApp');
    expect(html).toContain('href="tel:+34600000000"');
    expect(html.match(/href="tel:\+34/g)!.length).toBeGreaterThanOrEqual(2); // cabecera + hero
  });

  it('franja de confianza: exactamente garantía sin plazo, sin obras y hoteles; sin años ni «Un solo teléfono»', () => {
    expect(franja(html)).toEqual(['Garantía por escrito', 'Sin obras ni polvo', 'Trabajamos para hoteles y comunidades']);
    expect(texto).not.toMatch(/Garantía por escrito de/);
    expect(texto).not.toContain('Un solo teléfono');
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

  it('sin estilos sueltos ni hex (fuera del JSON-LD y de las variables internas de Astryx)', () => {
    expect(html).not.toContain('<style');
    // El CheckboxInput de Astryx del formulario pinta su centrado en línea (StyleX); estilosEnLinea lo tolera.
    expect(estilosEnLinea(sinVariablesAstryx(html))).toEqual([]);
    expect(sinScripts(html)).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('todo el contenido, franja incluida, va dentro del contenedor con margen lateral `portada`', () => {
    const portada = renderToStaticMarkup(<Portada negocio={negocio} config={config} modo="publico" {...contenido} />);
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
    expect(fila).not.toContain('ILUSTRACIÓN');
    expect(fila).not.toContain('ANTES · DESPUÉS');
    expect(fila).not.toContain('Pronto, fotos reales de este trabajo');
  });

  it('una sola cinta «ILUSTRACIONES» encima de las miniaturas sin foto', () => {
    const seccion = /<section[^>]*aria-labelledby="portada-antes-despues-titulo"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';
    const ul = seccion.search(/<ul[^>]*data-direction="horizontal"/);
    expect(ul).toBeGreaterThan(-1);
    const cinta = seccion.indexOf('ILUSTRACIONES');
    expect(cinta).toBeGreaterThan(-1);
    expect(cinta).toBeLessThan(ul);
    expect(seccion.match(/ILUSTRACIONES/g)).toHaveLength(1);
    expect(readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8')).not.toMatch(/\.portada-miniatura\s+\.cinta-etiqueta/);
  });

  it('el CTA secundario a ancho completo va antes y separado del enlace a todos los trabajos', () => {
    const seccion = /<section[^>]*aria-labelledby="portada-antes-despues-titulo"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';
    expect(seccion).toMatch(/<a[^>]*class="[^"]*portada-cta[^"]*"[^>]*data-variant="secondary"/);
    expect(seccion.indexOf('Manda la foto del tuyo')).toBeLessThan(seccion.indexOf('Ver todos los trabajos'));
    expect(seccion).not.toMatch(/data-direction="horizontal"[^>]*>(?:(?!<\/ul>)[\s\S])*Ver todos los trabajos/);
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
    const conResenas = pinta(negocio, config, { resenas: [r(5, 1), r(5, 2), r(4, 3)] });
    expect(textoPlano(conResenas)).toContain('Lo que dicen de nosotros');
    expect(textoPlano(conResenas)).toContain('4,7 / 5');
    const local = jsonLd(conResenas).find((d) => d['@type'] === 'LocalBusiness');
    expect(local.aggregateRating.ratingValue).toBe(4.7);
    expect(local.aggregateRating.reviewCount).toBe(3);
  });

  it('sigue habiendo un solo botón primario (más «Enviar petición» del formulario) y un solo H1', () => {
    // Excepción aceptada por la spec del formulario: su «Enviar petición» es el segundo primario de la portada.
    expect(html.match(/data-variant="primary"/g)).toHaveLength(2);
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
    expect(franja(html)).toEqual([
      'Garantía por escrito de 2 años',
      'Sin obras ni polvo',
      'Trabajamos para hoteles y comunidades',
      '15 años reparando baños',
    ]);
    expect(texto).not.toContain('Un solo teléfono');
    expect(texto).not.toMatch(/PENDIENTE|\{\{/);
  });
});

const h2s = (html: string) => [...html.matchAll(/<h2[^>]*>((?:(?!<\/h2>).)*)<\/h2>/gs)].map((m) => m[1].replace(/<[^>]+>/g, ''));
const tarjetas = (html: string) =>
  [...html.matchAll(/class="[^"]*\bastryx-clickable-card\b[^"]*"[^>]*><a aria-label="([^"]*)"[^>]*href="([^"]*)"/g)].map((m) => ({
    nombre: m[1],
    href: m[2],
  }));
/** Trozo del HTML entre dos H2 (la sección que empieza en `desde`). */
const seccion = (html: string, desde: string, hasta: string) => {
  const inicio = html.indexOf(`>${desde}</h2>`);
  return html.slice(inicio, html.indexOf(`>${hasta}</h2>`, inicio));
};

describe('portada: módulos tras la franja de confianza', () => {
  const html = pinta(negocio);
  const texto = textoPlano(html);

  it('los H2 van en el orden de design.md y después de la franja', () => {
    // Tras los módulos, el formulario de contacto cierra la portada (brain/design.md § Portada, 11).
    // Sin reseñas, el bloque de reseñas no existe (§ Portada, 8).
    expect(h2s(html)).toEqual([
      'Antes y después',
      '¿Reparar o cambiar?',
      'Cómo trabajamos',
      'Servicios',
      'Precios orientativos',
      'Preguntas frecuentes',
      'Zonas',
      'Mándanos una foto',
    ]);
    const franja = html.indexOf('aria-label="Nuestros compromisos"');
    expect(franja).toBeGreaterThan(0);
    expect(html.indexOf('>¿Reparar o cambiar?<')).toBeGreaterThan(franja);
  });

  it('los H2 de sección llevan type display-2, mayor que el display-3 del H3 del plato', () => {
    const etiquetas = [...html.matchAll(/<h2[^>]*>((?:(?!<\/h2>).)*)<\/h2>/gs)];
    expect(etiquetas.map((m) => m[1].replace(/<[^>]+>/g, ''))).toEqual([
      'Antes y después',
      '¿Reparar o cambiar?',
      'Cómo trabajamos',
      'Servicios',
      'Precios orientativos',
      'Preguntas frecuentes',
      'Zonas',
      'Mándanos una foto',
    ]);
    for (const [h2] of etiquetas) expect(h2).toMatch(/^<h2[^>]*\bdata-type="display-2"/);
  });

  const seccionServicios = (h: string) => seccion(h, 'Servicios', 'Precios orientativos');
  const nombresTarjetas = (h: string) =>
    [...seccionServicios(h).matchAll(/<h3[^>]*>((?:(?!<\/h3>).)*)<\/h3>/gs)].map((m) => m[1].replace(/<[^>]+>/g, ''));
  const hrefsInternos = (h: string) =>
    [...seccionServicios(h).matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]).filter((href) => !href.startsWith('//'));

  it('una tarjeta por servicio, el plato primero y Hoteles al final', () => {
    const nombres = nombresTarjetas(html);
    expect(nombres).toHaveLength(servicios.length);
    expect(nombres).toHaveLength(10);
    expect(nombres[0]).toBe(servicios.find((s) => s.tipo === 'principal')!.nombre);
    expect(nombres[0]).toBe('Reparación y esmaltado de platos de ducha');
    expect(nombres.at(-1)).toBe('Hoteles y comunidades');
    expect([...nombres].sort()).toEqual(servicios.map((s) => s.nombre).sort());
  });

  it('ninguna tarjeta de Servicios enlaza a una ruta sin página generada', () => {
    const hrefs = hrefsInternos(html);
    for (const href of hrefs) expect(rutaGenerada(href), `enlace roto: ${href}`).toBe(true);
    // Cada tarjeta enlaza a su ruta exactamente cuando esa página existe.
    const conPagina = servicios.filter((s) => rutaGenerada(s.ruta)).map((s) => s.ruta);
    expect(tarjetas(html).map((t) => t.href).sort()).toEqual(conPagina.sort());
    // Las tarjetas que sí enlazan lo hacen a la ruta de su servicio.
    const rutas = new Map(servicios.map((s) => [s.nombre, s.ruta]));
    for (const { nombre, href } of tarjetas(html)) expect(href).toBe(rutas.get(nombre));
  });

  it('un servicio nuevo en el contenido aparece sin tocar componentes', () => {
    const nuevo: Servicio = {
      ...structuredClone(servicios[1]),
      slug: 'lavabos',
      nombre: 'Reparación de lavabos',
      ruta: '/servicios/lavabos/',
      orden: 11,
    };
    const otro = pinta(negocio, config, { servicios: [...servicios, nuevo] });
    expect(nombresTarjetas(otro)).toHaveLength(11);
    expect(nombresTarjetas(otro)).toContain('Reparación de lavabos');
    expect(hrefsInternos(otro).includes('/servicios/lavabos/')).toBe(rutaGenerada('/servicios/lavabos/'));
  });

  it('los pasos sin plazos confirmados usan los textos sin plazo; con plazos, los plazos', () => {
    expect(texto).toContain('Presupuesto gratuito y sin compromiso');
    expect(texto).toContain('Reparación sin obras ni polvo');
    const n: Negocio = structuredClone(negocio);
    n.plazos.presupuesto = { valor: 'en 24 h', confirmado: true };
    n.plazos.reparacion = { valor: 'en unas horas', confirmado: true };
    const otro = textoPlano(pinta(n));
    expect(otro).toContain('Presupuesto gratuito en 24 h');
    expect(otro).toContain('Reparación en unas horas');
  });

  it('la tabla sin cifras confirmadas no habla de coste; con el coste confirmado, sí', () => {
    expect(texto).not.toContain('Coste');
    expect(texto).not.toContain('865');
    const c: Comparativa = structuredClone(comparativa);
    c.filas[0].reparar = { valor: 'Desde 150 €', confirmado: true };
    c.filas[0].cambiar = { valor: '865-1.200 €', confirmado: true };
    const otro = textoPlano(pinta(negocio, config, { comparativa: c }));
    expect(otro).toContain('Coste');
    expect(otro).toContain('865-1.200 €');
  });

  it('sin precios confirmados: «Pide presupuesto gratuito» y WhatsApp secundario; con uno, «Desde X €»', () => {
    const precios = seccion(html, 'Precios orientativos', 'Zonas');
    expect(textoPlano(precios)).toContain('Pide presupuesto gratuito');
    expect(precios).toMatch(/<a[^>]*data-variant="secondary"[^>]*href="https:\/\/wa\.me\//);
    const s = structuredClone(servicios);
    s[0].precio_desde = { valor: 90, confirmado: true };
    const otro = textoPlano(seccion(pinta(negocio, config, { servicios: s }), 'Precios orientativos', 'Zonas'));
    expect(otro).toContain(s[0].nombre);
    expect(otro).toContain('Desde 90 €');
    expect(otro).not.toContain(s[1].nombre);
  });

  it('sigue habiendo un solo primario (aparte del «Enviar petición» del formulario) y nada pendiente ni hex', () => {
    const primarios = [...html.matchAll(/<(a|button)\b[^>]*data-variant="primary"[^>]*>/g)].map((m) => m[0]);
    expect(primarios.filter((p) => !p.includes('id="enviar-peticion"'))).toHaveLength(1);
    expect(primarios).toHaveLength(2);
    expect(texto).not.toMatch(/PENDIENTE|\{\{/);
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it('cierra con las zonas y «¿No ves tu zona? Pregúntanos por WhatsApp»', () => {
    expect(texto).toContain('¿No ves tu zona? Pregúntanos por WhatsApp');
    for (const z of [...zonas.madrid_capital, ...zonas.municipios]) expect(texto).toContain(z);
  });
});

describe('página /zonas/', () => {
  const html = renderToStaticMarkup(
    <Frame brand={APP_NAME} nav={NAV} llamar={llamar}>
      <Zonas negocio={negocio} zonas={zonas} />
    </Frame>,
  );
  const texto = textoPlano(html);

  it('un único H1, todos los distritos y municipios y un solo primario de WhatsApp', () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(h1(html)).toBe('Zonas donde reparamos en Madrid');
    for (const z of [...zonas.madrid_capital, ...zonas.municipios]) expect(texto).toContain(z);
    expect(texto).toContain('¿No ves tu zona? Pregúntanos por WhatsApp');
    expect(html.match(/data-variant="primary"/g)).toHaveLength(1);
    expect(html).toMatch(/data-variant="primary"[^>]*href="https:\/\/wa\.me\/\d+\?text=Hola%2C%20vivo%20en/);
    expect(texto).not.toMatch(/PENDIENTE|\{\{/);
    expect(estilosEnLinea(html)).toEqual([]);
  });

  it('va dentro del contenedor `portada` y tiene metadatos propios sin plazos', () => {
    const vista = renderToStaticMarkup(<Zonas negocio={negocio} zonas={zonas} />);
    expect(vista).toMatch(/^<[a-z]+ [^>]*class="[^"]*\bportada\b[^"]*"/);
    const metadataZonas = metadataDeZonas();
    expect(String(metadataZonas.title)).toMatch(/[Zz]onas/);
    expect(String(metadataZonas.description)).toMatch(/Madrid/);
    expect(`${metadataZonas.title} ${metadataZonas.description}`).not.toMatch(/\d+\s*(h|horas|días|años)\b|en el día|en unas horas|PENDIENTE/);
  });

  it('cada página lleva su propio canonical: url_base + ruta', () => {
    const base = negocio.url_base.replace(/\/+$/, '');
    const porRuta: Record<string, Metadata> = {
      '/': metadataDePortada(),
      '/zonas/': metadataDeZonas(),
      '/preguntas-frecuentes/': metadataDeFaq(),
      '/contacto/': metadataDeContacto(),
      '/antes-y-despues/': metadataDeAntesYDespues(),
      '/privacidad/': metadataDePrivacidad(),
      '/platos-de-ducha/': metadataDePlatos(),
      '/tarifas/': metadataDeTarifas(),
    };
    const canonicals = new Set<unknown>();
    for (const ruta of PAGES) {
      const meta = porRuta[ruta];
      expect(meta, `falta metadata para ${ruta}`).toBeDefined();
      expect(meta!.alternates?.canonical, `canonical en ${ruta}`).toBe(`${base}${ruta}`);
      canonicals.add(meta!.alternates?.canonical);
    }
    expect(canonicals.size).toBe(PAGES.length);
  });

  it('está en la navegación y en las páginas públicas', () => {
    expect(NAV).toContainEqual({ href: '/zonas/', label: 'Zonas' });
    expect(PAGES).toContain('/zonas/');
  });
});

describe('franja de la portada desde textos.ts', () => {
  it('page.tsx no escribe los textos de la franja: usa compromisosFranja', () => {
    const src = readFileSync(join(process.cwd(), 'src/app/page.tsx'), 'utf8');
    expect(src).not.toContain('Sin obras ni polvo');
    expect(src).not.toContain('hoteles y comunidades');
    expect(src).not.toContain('Un solo teléfono');
    expect(src).toContain('compromisosFranja');
  });

  it('cuenta los <li> de «Nuestros compromisos»: 3 sin confirmar y 4 con todo confirmado', () => {
    const cuenta = (html: string) => ulFranja(html).match(/<li[\s>]/g)?.length ?? 0;
    expect(cuenta(pinta(negocio))).toBe(3);
    expect(cuenta(pinta(confirmado))).toBe(4);
  });
});

describe('FranjaConfianza', () => {
  const lis = (html: string) => html.match(/<li[\s>]/g) ?? [];
  const svgDe = (html: string, texto: string) => {
    const li = [...html.matchAll(/<li[\s>](?:(?!<\/li>).)*<\/li>/gs)].map((m) => m[0]).find((l) => l.includes(texto)) ?? '';
    return /<svg(?:(?!<\/svg>).)*<\/svg>/s.exec(li)?.[0] ?? '';
  };

  it('pinta garantía y años con iconos distintos, y sin «anios» no hay fila de años', () => {
    const html = renderToStaticMarkup(
      <FranjaConfianza
        compromisos={[
          { tipo: 'garantia', texto: 'Garantía por escrito' },
          { tipo: 'anios', texto: '15 años reparando baños' },
        ]}
      />,
    );
    expect(lis(html)).toHaveLength(2);
    const garantia = svgDe(html, 'Garantía por escrito');
    const anios = svgDe(html, '15 años reparando baños');
    expect(garantia).not.toBe('');
    expect(anios).not.toBe('');
    expect(anios).toMatch(/<(path|rect|circle|ellipse)[\s>]/);
    expect(anios).not.toBe(garantia);
    expect(anios).not.toContain(/<path[^>]*>/.exec(garantia)![0]);

    const sinAnios = renderToStaticMarkup(<FranjaConfianza compromisos={[{ tipo: 'garantia', texto: 'Garantía por escrito' }]} />);
    expect(lis(sinAnios)).toHaveLength(1);
    expect(sinAnios).not.toContain('años reparando');
  });

  it('el fuente tiene un solo IconoCompromiso y ninguna prop `anios`', () => {
    const src = readFileSync(join(process.cwd(), 'src/ui/FranjaConfianza.tsx'), 'utf8');
    expect(src.match(/<IconoCompromiso/g)).toHaveLength(1);
    expect(src).not.toContain('anios?');
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
    const html = renderToStaticMarkup(<Portada negocio={negocio} config={config} modo="publico" {...contenido} />);
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
