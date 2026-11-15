import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadConfig } from './config.js';

describe('loadConfig()', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sin IP_SALT genera una sal aleatoria de 64 hex y avisa', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const a = loadConfig({});
    expect(a.ipSalt).toMatch(/^[0-9a-f]{64}$/);
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]![0])).toMatch(/IP_SALT/);
    expect(loadConfig({}).ipSalt).not.toBe(a.ipSalt);
  });

  it('con IP_SALT la usa sin avisar', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(loadConfig({ IP_SALT: 'abc' }).ipSalt).toBe('abc');
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
