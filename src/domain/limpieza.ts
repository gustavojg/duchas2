import type { DatabaseSync } from 'node:sqlite';
import { borrarFoto } from './foto.js';

/**
 * Retención (ADR 0006): borra las peticiones con más de `dias` días y sus fotos, y los envios_ip que ya están
 * fuera de la ventana del límite. Se ejecuta al arrancar, cada 24 h y con `pnpm limpieza`.
 */
export function borrarCaducadas(
  db: DatabaseSync,
  dataDir: string,
  dias: number,
  ahora: Date,
  ventanaMin = 60,
): { peticiones: number; ips: number } {
  const t = ahora.getTime();
  const limite = t - dias * 86400000;
  const viejas = db
    .prepare('SELECT id, foto_fichero FROM peticiones WHERE creada_en < ?')
    .all(limite) as { id: string; foto_fichero: string | null }[];
  const borrar = db.prepare('DELETE FROM peticiones WHERE id = ?');
  for (const p of viejas) {
    if (p.foto_fichero) borrarFoto(dataDir, p.foto_fichero);
    borrar.run(p.id);
  }
  const ips = db.prepare('DELETE FROM envios_ip WHERE creado_en < ?').run(t - ventanaMin * 60000);
  return { peticiones: viejas.length, ips: Number(ips.changes) };
}
