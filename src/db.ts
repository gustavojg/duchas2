import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Base de datos SQLite (módulo integrado de Node). Un fichero DATA_DIR/app.db.
 * Las migraciones son aditivas e idempotentes: se añaden al final de MIGRATIONS, nunca se editan.
 */
export const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  // Peticiones del formulario de contacto (F5). Fechas en ms epoch; teléfono normalizado +34XXXXXXXXX;
  // foto en DATA_DIR/fotos/<id>.<ext> (nunca servida por HTTP). Se borran pasado retencion_dias.
  `CREATE TABLE IF NOT EXISTS peticiones (
    id TEXT PRIMARY KEY,
    creada_en INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    pieza TEXT NOT NULL CHECK (pieza IN ('plato_ducha', 'banera', 'azulejos', 'otro')),
    dano TEXT,
    zona TEXT,
    mensaje TEXT,
    pagina_origen TEXT,
    foto_fichero TEXT,
    foto_mime TEXT,
    foto_bytes INTEGER,
    privacidad_aceptada_en INTEGER NOT NULL,
    email_enviado_en INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS peticiones_creada_en ON peticiones (creada_en)`,
  // Intentos de envío por IP para el límite (5 por IP cada 60 min). La IP nunca en claro: HMAC-SHA256 con IP_SALT.
  `CREATE TABLE IF NOT EXISTS envios_ip (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_hash TEXT NOT NULL,
    creado_en INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS envios_ip_hash_creado ON envios_ip (ip_hash, creado_en)`,
];

/** `openDb(':memory:')` en los tests; `openDb(path.join(config.dataDir, 'app.db'))` en el servidor. */
export function openDb(file: string): DatabaseSync {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  for (const sql of MIGRATIONS) db.exec(sql);
  return db;
}
