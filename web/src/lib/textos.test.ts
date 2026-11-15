import { describe, expect, it } from 'vitest';
import { anios, compromisosFranja, garantia, HOTELES, precioDesde, presupuesto, reparacion, respuesta, SIN_OBRAS, titularPortada } from './textos.ts';

const si = <T>(valor: T) => ({ valor, confirmado: true });
const no = <T>(valor: T | null = null) => ({ valor, confirmado: false });

describe('tabla de textos del PRD (§ Regla común)', () => {
  it('plazo de presupuesto', () => {
    expect(presupuesto(si('en 24 h'), 'publico')).toBe('Presupuesto gratuito en 24 h');
    expect(presupuesto(no('en 24 h'), 'publico')).toBe('Presupuesto gratuito y sin compromiso');
  });

  it('duración de la reparación', () => {
    expect(reparacion(si('en unas horas'), 'publico')).toBe('Reparado en unas horas');
    expect(reparacion(si('en el día'), 'publico')).toBe('Reparado en el día');
    expect(reparacion(no(), 'publico')).toBe('Sin obras ni polvo');
  });

  it('plazo de respuesta', () => {
    expect(respuesta(si('en menos de 24 h'), 'publico')).toBe('Te respondemos en menos de 24 h');
    expect(respuesta(no(), 'publico')).toBe('Te respondemos lo antes posible');
  });

  it('años de experiencia: solo con cifra confirmada y nunca «0 años»', () => {
    expect(anios(si(15), 'publico')).toBe('15 años reparando baños');
    expect(anios(si(1), 'publico')).toBe('1 año reparando baños');
    expect(anios(no(15), 'publico')).toBe('');
    expect(anios(no(), 'publico')).toBe('');
    expect(anios(si(0), 'publico')).toBe('');
    expect(anios(si(0), 'pendientes')).not.toContain('0 años');
    expect(anios(no(), 'pendientes')).toBe('{{PENDIENTE}}');
  });

  it('garantía: con plazo confirmado, o «Garantía por escrito» y el marcador solo en pendientes', () => {
    expect(garantia(si(2), 'publico')).toBe('Garantía por escrito de 2 años');
    expect(garantia(si(1), 'publico')).toBe('Garantía por escrito de 1 año');
    expect(garantia(no(), 'publico')).toBe('Garantía por escrito');
    expect(garantia(no(), 'publico')).not.toContain('PENDIENTE');
    expect(garantia(si(0), 'publico')).toBe('Garantía por escrito');
    expect(garantia(no(), 'pendientes')).toContain('Garantía por escrito');
    expect(garantia(no(), 'pendientes')).toContain('{{PENDIENTE}}');
  });

  it('precio desde', () => {
    expect(precioDesde(si(150), 'publico')).toBe('Desde 150 €');
    expect(precioDesde(no(150), 'publico')).toBe('Pide presupuesto gratuito');
    expect(precioDesde(si(0), 'publico')).toBe('Pide presupuesto gratuito');
  });
});

describe('titularPortada()', () => {
  it('habla de reparar sin obras y con garantía; el plazo solo si está confirmado', () => {
    const sin = titularPortada(no('en unas horas'), 'publico');
    expect(sin).toMatch(/plato de ducha se repara/);
    expect(sin).toMatch(/[Ss]in obras/);
    expect(sin).toMatch(/garantía/);
    expect(sin).not.toMatch(/en unas horas|en el día/);
    const con = titularPortada(si('en unas horas'), 'publico');
    expect(con).toContain('en unas horas');
    expect(con).toMatch(/[Ss]in obras/);
    expect(con).not.toBe(sin);
    expect(titularPortada(no(), 'pendientes')).toContain('{{PENDIENTE}}');
  });
});

describe('compromisosFranja()', () => {
  const tipos = (cs: { tipo: string }[]) => cs.map((c) => c.tipo);

  it('sin confirmar (público): garantía sin plazo, sin obras y hoteles; sin años', () => {
    const cs = compromisosFranja({ garantia: { anios: no() }, anios: no() }, 'publico');
    expect(tipos(cs)).toEqual(['garantia', 'sin-obras', 'hoteles']);
    expect(cs[0].texto).toBe('Garantía por escrito');
    expect(cs[1].texto).toBe(SIN_OBRAS);
    expect(cs[2].texto).toBe(HOTELES);
    expect(SIN_OBRAS).toBe('Sin obras ni polvo');
    expect(HOTELES).toBe('Trabajamos para hoteles y comunidades');
  });

  it('con garantía y años confirmados: los cuatro, por orden', () => {
    const cs = compromisosFranja({ garantia: { anios: si(2) }, anios: si(15) }, 'publico');
    expect(tipos(cs)).toEqual(['garantia', 'sin-obras', 'hoteles', 'anios']);
    expect(cs[0].texto).toBe('Garantía por escrito de 2 años');
    expect(cs[3].texto).toBe('15 años reparando baños');
  });

  it('años a 0 o sin confirmar: no hay compromiso «anios»', () => {
    expect(tipos(compromisosFranja({ garantia: { anios: si(2) }, anios: si(0) }, 'publico'))).not.toContain('anios');
    expect(tipos(compromisosFranja({ garantia: { anios: si(2) }, anios: no(15) }, 'publico'))).not.toContain('anios');
  });

  it('ninguno habla de «Un solo teléfono»', () => {
    const cs = compromisosFranja({ garantia: { anios: si(2) }, anios: si(15) }, 'publico');
    expect(tipos(cs)).not.toContain('un-telefono');
    for (const c of cs) expect(c.texto).not.toMatch(/teléfono/i);
  });
});
