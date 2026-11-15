import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { fotoDemasiadoGrande, MENSAJES, PIEZAS } from '../lib/contacto';
import { type EstadoEnvio, FormularioContacto, type FormularioContactoProps, VALORES_INICIALES } from './FormularioContacto';

const base: FormularioContactoProps = {
  valores: VALORES_INICIALES,
  errores: {},
  estado: 'inicial',
  config: { retencion_dias: 90, foto_max_mb: 10 },
  contacto: {
    whatsapp: '+34 600 000 000',
    telefono: '+34 600 000 000',
    mensajeWhatsApp: 'Hola, os mando una foto del daño para que me digáis si tiene arreglo.',
    plazoRespuesta: 'Te respondemos lo antes posible',
  },
  paginaOrigen: '/contacto/',
  onCambio: () => {},
  onFoto: () => {},
  onEnviar: () => {},
};

const pinta = (p: Partial<FormularioContactoProps> = {}) => renderToStaticMarkup(<FormularioContacto {...base} {...p} />);
const texto = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
/** El CheckboxInput de Astryx pinta este estilo en línea (centrado del input, StyleX); no es nuestro. */
const sinEstiloAstryx = (html: string) => html.replaceAll('style="--x-transform:translate(-50%, -50%)"', '');
/** Fragmento entre el atributo y el siguiente mensaje de estado: el error va pegado a su campo. */
const junto = (html: string, ancla: string, mensaje: string) => {
  const i = html.indexOf(ancla);
  expect(i, `no está ${ancla}`).toBeGreaterThan(-1);
  const j = html.indexOf(mensaje, i);
  expect(j, `«${mensaje}» no aparece tras ${ancla}`).toBeGreaterThan(i);
  expect(j - i).toBeLessThan(2500);
};

describe('FormularioContacto (inicial)', () => {
  const html = pinta();
  const t = texto(html);

  it('pinta todos los campos con su name', () => {
    for (const n of ['nombre', 'telefono', 'zona', 'mensaje', 'privacidad', 'web', 'pagina_origen', 'dano']) {
      expect(html, n).toContain(`name="${n}"`);
    }
    expect(html).toContain('role="radiogroup"');
    for (const v of ['plato_ducha', 'banera', 'azulejos', 'otro']) expect(html).toContain(`data-value="${v}"`);
    expect(html).toContain('type="tel"');
    expect(t).toContain('Te llamamos o escribimos a este número');
  });

  it('foto: accept exacto, sin capture, botón «Añadir foto del daño» y ayuda con el máximo', () => {
    expect(html).toContain('type="file"');
    expect(html).toContain('accept="image/jpeg,image/png,image/webp,image/heic,.heic"');
    expect(html).not.toContain('capture');
    expect(t).toContain('Añadir foto del daño');
    expect(t).toContain('Con una foto del daño te decimos si tiene arreglo. Máximo 10 MB.');
    expect(texto(pinta({ config: { retencion_dias: 90, foto_max_mb: 5 } }))).toContain('Máximo 5 MB.');
  });

  it('pieza: SegmentedControl con icono y los valores de PIEZAS, dentro de .campo-pieza-opciones que deja saltar de línea', () => {
    const i = html.indexOf('class="campo-pieza-opciones"');
    expect(i).toBeGreaterThan(-1);
    const control = html.slice(i, html.indexOf('</template>', i));
    expect(control).toContain('role="radiogroup"');
    for (const v of PIEZAS) expect(control).toContain(`data-value="${v}"`);
    expect(control.match(/campo-pieza-icono/g)).toHaveLength(PIEZAS.length);
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
    const regla = css.match(/\.campo-pieza-opciones \.astryx-segmented-control\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(regla).toMatch(/flex-wrap:\s*wrap/);
    expect(regla).toMatch(/max-inline-size:\s*100%/);
    const reglas = css.match(/\.campo-pieza-opciones[^{]*\{[^}]*\}/g)!.join('\n');
    expect(reglas).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\d+(px|rem)\b/);
  });

  it('casilla de privacidad con enlace a /privacidad/', () => {
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('href="/privacidad/"');
  });

  it('casilla de privacidad sin la marca «Obligatorio» de Astryx (a 360 px queda suelta): avisa MENSAJES.privacidad', () => {
    const i = html.indexOf('name="privacidad"');
    const etiqueta = html.slice(i, html.indexOf('href="/privacidad/"', i));
    expect(etiqueta).toContain('He leído y acepto la política de privacidad');
    expect(texto(etiqueta)).not.toContain('Obligatorio');
    expect(texto(etiqueta)).not.toContain('∙');
  });

  it('honeypot `web` oculto con clase, aria-hidden y tabindex -1; pagina_origen oculto', () => {
    expect(html).toMatch(/<input[^>]*name="web"[^>]*>/);
    const trampa = /<input[^>]*name="web"[^>]*>/.exec(html)![0];
    expect(trampa).toContain('aria-hidden="true"');
    expect(trampa).toContain('tabindex="-1"');
    expect(trampa).toMatch(/class="[^"]*\bcampo-trampa\b/);
    expect(html).toMatch(/<input[^>]*type="hidden"[^>]*name="pagina_origen"[^>]*value="\/contacto\/"/);
  });

  it('retención con el número de config', () => {
    expect(t).toContain('Guardamos tu foto 90 días');
    expect(texto(pinta({ config: { retencion_dias: 30, foto_max_mb: 10 } }))).toContain('Guardamos tu foto 30 días');
  });

  it('un único botón primario: «Enviar petición» con id enviar-peticion', () => {
    expect(html.match(/data-variant="primary"/g)).toHaveLength(1);
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*data-variant="primary"[^>]*id="enviar-peticion"/);
    expect(t).toContain('Enviar petición');
    expect(html).not.toContain('Banner');
  });

  it('enviando: botón deshabilitado con «Enviando…»', () => {
    const h = pinta({ estado: 'enviando' });
    expect(h).toMatch(/id="enviar-peticion"[^>]*aria-disabled="true"/);
    expect(texto(h)).toContain('Enviando…');
  });
});

describe('FormularioContacto (errores)', () => {
  const html = pinta({
    errores: { telefono: MENSAJES.telefono_falta, nombre: MENSAJES.nombre, privacidad: MENSAJES.privacidad },
  });

  it('cada mensaje junto a su campo', () => {
    junto(html, 'name="telefono"', 'Falta tu teléfono.');
    junto(html, 'name="nombre"', 'Dinos tu nombre.');
    junto(html, 'name="privacidad"', 'Marca la casilla de privacidad para enviar.');
    expect(html.match(/aria-invalid="true"/g)!.length).toBeGreaterThanOrEqual(3);
  });

  it('errores.foto (413 y 415) junto al campo de foto', () => {
    const grande = pinta({ errores: { foto: fotoDemasiadoGrande(10) } });
    junto(grande, 'type="file"', 'La foto pesa más de 10 MB; prueba con otra o envíala por WhatsApp');
    const tipo = pinta({ errores: { foto: MENSAJES.foto_tipo } });
    junto(tipo, 'type="file"', 'Solo se admiten fotos (JPG, PNG, WebP o HEIC)');
  });

  it('con foto elegida muestra su nombre y el botón para quitarla', () => {
    const t = texto(pinta({ valores: { ...VALORES_INICIALES, fotoNombre: 'plato.jpg' } }));
    expect(t).toContain('plato.jpg');
    expect(t).toContain('Quitar foto');
  });
});

describe('FormularioContacto (estados del envío)', () => {
  it('ok: confirmación con el plazo recibido y WhatsApp secundario', () => {
    const html = pinta({ estado: 'ok' });
    const t = texto(html);
    expect(t).toContain('Recibido. Te respondemos lo antes posible');
    expect(t).toContain('¿Quieres adelantar la foto? Mándala por WhatsApp');
    expect(html).toMatch(/data-variant="secondary"[^>]*href="https:\/\/wa\.me\/34600000000\?text=/);
    expect(html).not.toContain('data-variant="primary"');
    const plazo = texto(pinta({ estado: 'ok', contacto: { ...base.contacto, plazoRespuesta: 'Te respondemos en menos de 24 h' } }));
    expect(plazo).toContain('Te respondemos en menos de 24 h');
  });

  it('limite (429): mensaje con Llamar y WhatsApp', () => {
    const html = pinta({ estado: 'limite' });
    expect(texto(html)).toContain('Has enviado varias peticiones; llámanos o escríbenos por WhatsApp');
    expect(html).toContain('href="tel:+34600000000"');
    expect(html).toMatch(/href="https:\/\/wa\.me\/34600000000\?text=/);
    expect(html.match(/data-variant="primary"/g)).toHaveLength(1);
  });

  it('error: mensaje con teléfono y WhatsApp, y el formulario conserva los valores', () => {
    const valores = { ...VALORES_INICIALES, nombre: 'Marta', telefono: '611 22 33 44', zona: 'Carabanchel' };
    const html = pinta({ estado: 'error', valores });
    expect(texto(html)).toContain(
      'No hemos podido enviar tu petición. No has perdido nada: llámanos o mándanos la foto por WhatsApp.',
    );
    expect(html).toContain('value="Marta"');
    expect(html).toContain('value="611 22 33 44"');
    expect(html).toContain('value="Carabanchel"');
    expect(html).toContain('href="tel:+34600000000"');
    expect(html).toMatch(/href="https:\/\/wa\.me\/34600000000\?text=/);
    expect(html).toContain('id="enviar-peticion"');
  });

  it('sin style= propios ni hex en ningún estado', () => {
    for (const estado of ['inicial', 'enviando', 'ok', 'limite', 'error'] as EstadoEnvio[]) {
      const html = sinEstiloAstryx(pinta({ estado, errores: { foto: MENSAJES.foto_tipo } }));
      expect(html, estado).not.toContain('style=');
      expect(html, estado).not.toContain('<style');
      expect(html, estado).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });
});
