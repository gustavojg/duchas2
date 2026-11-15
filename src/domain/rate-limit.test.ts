import { describe, expect, it } from 'vitest';
import { openDb } from '../db.js';
import { hashIp, registrarIntento } from './rate-limit.js';

const filas = (db: ReturnType<typeof openDb>) => (db.prepare('SELECT COUNT(*) AS n FROM envios_ip').get() as { n: number }).n;

describe('hashIp()', () => {
  it('es determinista, depende de la sal y no contiene la IP', () => {
    const h = hashIp('203.0.113.1', 'sal');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(hashIp('203.0.113.1', 'sal')).toBe(h);
    expect(hashIp('203.0.113.1', 'otra')).not.toBe(h);
    expect(h).not.toContain('203.0.113.1');
  });
});

describe('registrarIntento()', () => {
  const opts = { limite: 5, ventanaMin: 60 };
  const t0 = new Date('2026-01-01T10:00:00Z');
  const en = (min: number) => new Date(t0.getTime() + min * 60000);

  it('admite 5 intentos, bloquea el 6º sin insertarlo y vuelve a admitir pasada la ventana', () => {
    const db = openDb(':memory:');
    const ipHash = hashIp('203.0.113.1', 'sal');
    for (let i = 0; i < 5; i++) expect(registrarIntento(db, { ipHash, ahora: t0, ...opts })).toBe(true);
    expect(filas(db)).toBe(5);
    expect(registrarIntento(db, { ipHash, ahora: en(10), ...opts })).toBe(false);
    expect(filas(db)).toBe(5);
    expect(registrarIntento(db, { ipHash, ahora: en(61), ...opts })).toBe(true);
  });

  it('la ventana es deslizante', () => {
    const db = openDb(':memory:');
    const ipHash = hashIp('203.0.113.1', 'sal');
    for (let i = 0; i < 5; i++) registrarIntento(db, { ipHash, ahora: en(i * 10), ...opts });
    // A los 61 min solo el primero (min 0) ha salido de la ventana: cabe uno más y luego se bloquea.
    expect(registrarIntento(db, { ipHash, ahora: en(61), ...opts })).toBe(true);
    expect(registrarIntento(db, { ipHash, ahora: en(61), ...opts })).toBe(false);
  });

  it('otra IP no se ve afectada', () => {
    const db = openDb(':memory:');
    const a = hashIp('203.0.113.1', 'sal');
    for (let i = 0; i < 5; i++) registrarIntento(db, { ipHash: a, ahora: t0, ...opts });
    expect(registrarIntento(db, { ipHash: a, ahora: t0, ...opts })).toBe(false);
    expect(registrarIntento(db, { ipHash: hashIp('198.51.100.7', 'sal'), ahora: t0, ...opts })).toBe(true);
  });
});
