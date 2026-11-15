import { describe, expect, it } from 'vitest';
import { resolverIp } from './client-ip.js';

describe('resolverIp()', () => {
  it('sin trustProxy ignora X-Forwarded-For', () => {
    expect(resolverIp('198.51.100.7', '1.2.3.4', false)).toBe('198.51.100.7');
  });

  it('con trustProxy usa el primer elemento de X-Forwarded-For', () => {
    expect(resolverIp('198.51.100.7', '1.2.3.4', true)).toBe('1.2.3.4');
    expect(resolverIp('198.51.100.7', ' 1.2.3.4 , 10.0.0.1', true)).toBe('1.2.3.4');
    expect(resolverIp('198.51.100.7', null, true)).toBe('198.51.100.7');
    expect(resolverIp('198.51.100.7', '', true)).toBe('198.51.100.7');
  });

  it('sin IP remota ni cabecera devuelve «desconocida»', () => {
    expect(resolverIp(undefined, null, false)).toBe('desconocida');
    expect(resolverIp(undefined, null, true)).toBe('desconocida');
    expect(resolverIp(undefined, '1.2.3.4', false)).toBe('desconocida');
  });
});
