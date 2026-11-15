import { describe, expect, it } from 'vitest';
import { MIGRATIONS, openDb } from './db.js';

type Col = { name: string; notnull: number; pk: number; type: string };

describe('modelo de datos', () => {
  const db = openDb(':memory:');
  const tables = (db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table'`).all() as { name: string }[]).map((r) => r.name);
  const cols = (t: string) => db.prepare(`PRAGMA table_info(${t})`).all() as Col[];
  const indexes = (t: string) => (db.prepare(`PRAGMA index_list(${t})`).all() as { name: string }[]).map((r) => r.name);

  it('crea las tablas meta, peticiones y envios_ip', () => {
    for (const t of ['meta', 'peticiones', 'envios_ip']) expect(tables, t).toContain(t);
  });

  it('peticiones tiene las columnas de la arquitectura con id como clave', () => {
    const c = cols('peticiones');
    expect(c.map((x) => x.name)).toEqual([
      'id', 'creada_en', 'nombre', 'telefono', 'pieza', 'dano', 'zona', 'mensaje', 'pagina_origen',
      'foto_fichero', 'foto_mime', 'foto_bytes', 'privacidad_aceptada_en', 'email_enviado_en',
    ]);
    expect(c.find((x) => x.name === 'id')?.pk).toBe(1);
    for (const n of ['creada_en', 'nombre', 'telefono', 'pieza', 'privacidad_aceptada_en']) {
      expect(c.find((x) => x.name === n)?.notnull, n).toBe(1);
    }
    expect(indexes('peticiones')).toContain('peticiones_creada_en');
  });

  it('peticiones solo admite las piezas del formulario', () => {
    const ins = db.prepare(
      `INSERT INTO peticiones (id, creada_en, nombre, telefono, pieza, privacidad_aceptada_en) VALUES (?, 1, 'Marta', '+34612345678', ?, 1)`,
    );
    for (const p of ['plato_ducha', 'banera', 'azulejos', 'otro']) ins.run(`id-${p}`, p);
    expect(() => ins.run('id-x', 'lavabo')).toThrow();
  });

  it('envios_ip guarda el hash de la IP y la fecha, con índice para la ventana', () => {
    expect(cols('envios_ip').map((x) => x.name)).toEqual(['id', 'ip_hash', 'creado_en']);
    expect(indexes('envios_ip')).toContain('envios_ip_hash_creado');
  });

  it('las migraciones son idempotentes', () => {
    expect(() => {
      for (const sql of MIGRATIONS) db.exec(sql);
    }).not.toThrow();
  });
});
