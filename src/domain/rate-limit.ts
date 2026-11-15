import { createHmac } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';

/** HMAC-SHA256 de la IP con IP_SALT, en hex: la IP nunca se guarda en claro. */
export function hashIp(ip: string, salt: string): string {
  return createHmac('sha256', salt).update(ip).digest('hex');
}

export interface Intento { ipHash: string; ahora: Date; limite: number; ventanaMin: number }

/**
 * Límite por IP con ventana deslizante: si ya hay `limite` intentos con creado_en > ahora - ventana devuelve
 * false (limitado) sin insertar; si no, registra el intento en envios_ip y devuelve true.
 */
export function registrarIntento(db: DatabaseSync, { ipHash, ahora, limite, ventanaMin }: Intento): boolean {
  const t = ahora.getTime();
  const { n } = db
    .prepare('SELECT COUNT(*) AS n FROM envios_ip WHERE ip_hash = ? AND creado_en > ?')
    .get(ipHash, t - ventanaMin * 60000) as { n: number };
  if (n >= limite) return false;
  db.prepare('INSERT INTO envios_ip (ip_hash, creado_en) VALUES (?, ?)').run(ipHash, t);
  return true;
}
