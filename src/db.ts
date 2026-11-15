import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Base de datos SQLite (módulo integrado de Node). Un fichero DATA_DIR/app.db.
 * Las migraciones son aditivas e idempotentes: se añaden al final de MIGRATIONS, nunca se editan.
 */
export const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
];

/** `openDb(':memory:')` en los tests; `openDb(path.join(config.dataDir, 'app.db'))` en el servidor. */
export function openDb(file: string): DatabaseSync {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  for (const sql of MIGRATIONS) db.exec(sql);
  return db;
}
