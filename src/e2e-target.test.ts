import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { e2eTarget } from './e2e-target.js';

describe('script e2e:staging', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
    scripts: Record<string, string>;
  };

  it('existe, lanza playwright test, apunta por defecto a :8804 y respeta E2E_BASE_URL', () => {
    const script = pkg.scripts['e2e:staging'];
    expect(script).toBeDefined();
    expect(script).toContain('playwright test');
    expect(script).toContain('E2E_BASE_URL=${E2E_BASE_URL:-http://127.0.0.1:8804}');
  });
});

describe('e2eTarget', () => {
  it('sin variables apunta a 127.0.0.1:3100 y levanta servidor local', () => {
    expect(e2eTarget({})).toEqual({ baseURL: 'http://127.0.0.1:3100', usaServidorLocal: true });
  });

  it('respeta E2E_PORT con servidor local', () => {
    expect(e2eTarget({ E2E_PORT: '3200' })).toEqual({ baseURL: 'http://127.0.0.1:3200', usaServidorLocal: true });
  });

  it('con E2E_BASE_URL la usa sin barra final y no levanta servidor', () => {
    expect(e2eTarget({ E2E_BASE_URL: 'http://127.0.0.1:8804/' })).toEqual({
      baseURL: 'http://127.0.0.1:8804',
      usaServidorLocal: false,
    });
    expect(e2eTarget({ E2E_BASE_URL: 'https://staging.example.com', E2E_PORT: '3200' })).toEqual({
      baseURL: 'https://staging.example.com',
      usaServidorLocal: false,
    });
  });

  it('una E2E_BASE_URL vacía se trata como no definida', () => {
    expect(e2eTarget({ E2E_BASE_URL: '' })).toEqual({ baseURL: 'http://127.0.0.1:3100', usaServidorLocal: true });
  });

  it('lanza un error claro si E2E_BASE_URL no es http(s)', () => {
    expect(() => e2eTarget({ E2E_BASE_URL: 'ftp://x' })).toThrow(/E2E_BASE_URL/);
    expect(() => e2eTarget({ E2E_BASE_URL: 'basura' })).toThrow(/E2E_BASE_URL/);
  });
});
