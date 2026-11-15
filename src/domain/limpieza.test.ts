import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { openDb } from '../db.js';
import { guardarFoto } from './foto.js';
import { borrarCaducadas } from './limpieza.js';

const DIA = 86400000;
const ahora = new Date('2026-06-01T10:00:00Z');

function escenario() {
  const db = openDb(':memory:');
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'data-'));
  const ins = db.prepare(
    `INSERT INTO peticiones (id, creada_en, nombre, telefono, pieza, foto_fichero, privacidad_aceptada_en)
     VALUES (?, ?, 'Marta', '+34612345678', 'otro', ?, ?)`,
  );
  const peticion = (id: string, creada: number, foto = true) => {
    const fichero = foto ? guardarFoto(dataDir, id, new Uint8Array([0xff, 0xd8, 0xff]), 'jpg') : null;
    ins.run(id, creada, fichero, creada);
  };
  const ids = () => (db.prepare('SELECT id FROM peticiones ORDER BY id').all() as { id: string }[]).map((r) => r.id);
  const foto = (id: string) => fs.existsSync(path.join(dataDir, 'fotos', `${id}.jpg`));
  const ip = db.prepare('INSERT INTO envios_ip (ip_hash, creado_en) VALUES (?, ?)');
  const ips = () => (db.prepare('SELECT ip_hash FROM envios_ip ORDER BY ip_hash').all() as { ip_hash: string }[]).map((r) => r.ip_hash);
  return { db, dataDir, peticion, ids, foto, ip, ips };
}

describe('borrarCaducadas()', () => {
  it('con dias=0 borra todo lo anterior a ahora, fila y foto', () => {
    const e = escenario();
    e.peticion('a', ahora.getTime() - 1000);
    expect(borrarCaducadas(e.db, e.dataDir, 0, ahora).peticiones).toBe(1);
    expect(e.ids()).toEqual([]);
    expect(e.foto('a')).toBe(false);
  });

  it('con dias=90 borra la de hace 91 días con su foto y conserva la de ayer', () => {
    const e = escenario();
    e.peticion('vieja', ahora.getTime() - 91 * DIA);
    e.peticion('nueva', ahora.getTime() - 1 * DIA);
    e.peticion('sinfoto', ahora.getTime() - 100 * DIA, false);
    expect(borrarCaducadas(e.db, e.dataDir, 90, ahora).peticiones).toBe(2);
    expect(e.ids()).toEqual(['nueva']);
    expect(e.foto('vieja')).toBe(false);
    expect(e.foto('nueva')).toBe(true);
  });

  it('tolera que la foto ya no exista', () => {
    const e = escenario();
    e.peticion('a', ahora.getTime() - 91 * DIA);
    fs.rmSync(path.join(e.dataDir, 'fotos', 'a.jpg'));
    expect(() => borrarCaducadas(e.db, e.dataDir, 90, ahora)).not.toThrow();
    expect(e.ids()).toEqual([]);
  });

  it('borra los envios_ip fuera de la ventana (60 min por defecto) y conserva los recientes', () => {
    const e = escenario();
    e.ip.run('viejo', ahora.getTime() - 61 * 60000);
    e.ip.run('reciente', ahora.getTime() - 5 * 60000);
    expect(borrarCaducadas(e.db, e.dataDir, 90, ahora)).toEqual({ peticiones: 0, ips: 1 });
    expect(e.ips()).toEqual(['reciente']);
  });
});
