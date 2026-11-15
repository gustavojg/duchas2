import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadConfig } from './config.js';

describe('loadConfig()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sin IP_SALT no escribe en consola y devuelve una sal no vacía', () => {
    const spies = (['warn', 'log', 'error', 'info'] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {}),
    );
    const a = loadConfig({});
    expect(a.ipSalt).toMatch(/^[0-9a-f]{64}$/);
    expect(a.ipSaltGenerada).toBe(true);
    const b = loadConfig({ IP_SALT: '   ' });
    expect(b.ipSalt).toMatch(/^[0-9a-f]{64}$/);
    expect(b.ipSaltGenerada).toBe(true);
    expect(loadConfig({}).ipSalt).not.toBe(a.ipSalt);
    for (const s of spies) expect(s).not.toHaveBeenCalled();
  });

  it('con IP_SALT la usa sin avisar', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const c = loadConfig({ IP_SALT: 'abc' });
    expect(c.ipSalt).toBe('abc');
    expect(c.ipSaltGenerada).toBe(false);
    expect(warn).not.toHaveBeenCalled();
  });

  it('TRUST_PROXY: por defecto false, con 1 true', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(loadConfig({}).trustProxy).toBe(false);
    expect(loadConfig({ TRUST_PROXY: '0' }).trustProxy).toBe(false);
    expect(loadConfig({ TRUST_PROXY: '1' }).trustProxy).toBe(true);
    expect(() => loadConfig({ TRUST_PROXY: 'si' })).toThrow();
  });

  it('EMAIL_DESTINO se refleja en emailDestino', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(loadConfig({}).emailDestino).toBeUndefined();
    expect(loadConfig({ EMAIL_DESTINO: 'taller@ejemplo.test' }).emailDestino).toBe('taller@ejemplo.test');
  });
});
