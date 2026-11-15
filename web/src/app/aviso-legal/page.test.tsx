import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargarNegocio, type Negocio } from '../../lib/content';
import { AvisoLegal, metadata } from './page';

const negocio = cargarNegocio();
const textoPlano = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const confirmado: Negocio = structuredClone(negocio);
confirmado.legal.razon_social = { valor: 'Duchas Madrid SL', confirmado: true };
confirmado.legal.nif = { valor: 'B12345678', confirmado: true };
confirmado.legal.domicilio = { valor: 'Calle Falsa 1, Madrid', confirmado: true };

describe('aviso legal', () => {
  it('con datos confirmados muestra titular, NIF, domicilio y el teléfono del fichero', () => {
    const html = renderToStaticMarkup(<AvisoLegal negocio={confirmado} modo="publico" />);
    const texto = textoPlano(html);
    expect(texto).toContain('Duchas Madrid SL');
    expect(texto).toContain('B12345678');
    expect(texto).toContain('Calle Falsa 1, Madrid');
    expect(texto).toContain(negocio.telefono.valor!);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/class="[^"]*\btexto-largo\b[^"]*"/);
    expect(texto).not.toMatch(/PENDIENTE|\{\{|por confirmar/);
  });

  it('el email solo aparece si está confirmado', () => {
    const conEmail = structuredClone(confirmado);
    conEmail.email = { valor: 'hola@duchas.test', confirmado: false };
    expect(renderToStaticMarkup(<AvisoLegal negocio={conEmail} modo="publico" />)).not.toContain('hola@duchas.test');
    conEmail.email.confirmado = true;
    expect(renderToStaticMarkup(<AvisoLegal negocio={conEmail} modo="publico" />)).toContain('hola@duchas.test');
  });

  it('sin confirmar: {{PENDIENTE}} en local y «por confirmar» en público', () => {
    expect(renderToStaticMarkup(<AvisoLegal negocio={negocio} modo="pendientes" />)).toContain('{{PENDIENTE}}');
    const publico = renderToStaticMarkup(<AvisoLegal negocio={negocio} modo="publico" />);
    expect(publico).toContain('por confirmar');
    expect(publico).not.toContain('{{');
  });

  it('cubre condiciones de uso, propiedad intelectual y ley aplicable sin estilos sueltos', () => {
    const html = renderToStaticMarkup(<AvisoLegal negocio={confirmado} modo="publico" />);
    const texto = textoPlano(html);
    expect(texto).toMatch(/Condiciones de uso/);
    expect(texto).toMatch(/Propiedad intelectual/);
    expect(texto).toMatch(/Ley aplicable/);
    expect(html).not.toMatch(/<style|style=|<script/);
  });

  it('exporta metadata con canonical propio', () => {
    expect(metadata.alternates.canonical).toMatch(/\/aviso-legal\/$/);
    expect(metadata.openGraph.url).toBe(metadata.alternates.canonical);
  });
});

describe('.texto-largo (globals.css)', () => {
  it('columna centrada con relleno lateral y vertical, solo con tokens', () => {
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
    const regla = /\.texto-largo\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(regla).toMatch(/max-inline-size:\s*var\(--measure\)/);
    expect(regla).toMatch(/margin-inline:\s*auto/);
    expect(regla).toMatch(/padding-inline:\s*var\(--spacing-\d+\)/);
    expect(regla).toMatch(/padding-block:\s*var\(--spacing-\d+\)/);
    for (const decl of regla.split(';').map((d) => d.trim()).filter(Boolean)) {
      expect(decl).toMatch(/^[a-z-]+:\s*(var\(--[a-z0-9-]+\)|auto|100%|border-box)$/);
    }
  });
});
