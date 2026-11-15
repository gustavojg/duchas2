/**
 * `pnpm limpieza`: borra a mano lo que ha superado la retención (ADR 0006), igual que el servidor al arrancar y
 * cada 24 h: peticiones con más de retencion_dias y sus fotos, y envios_ip fuera de la ventana del límite.
 */
import path from 'node:path';
import { loadConfig } from '../src/config.js';
import { openDb } from '../src/db.js';
import { borrarCaducadas } from '../src/domain/limpieza.js';
import { configFormulario } from '../web/src/lib/config.js';

// La limpieza no usa la sal (borra por fecha): se rellena para no emitir el aviso de IP_SALT ausente.
const { dataDir } = loadConfig({ ...process.env, IP_SALT: process.env.IP_SALT || 'no-se-usa-en-la-limpieza' });
const formulario = configFormulario();
const db = openDb(path.join(dataDir, 'app.db'));
const r = borrarCaducadas(db, dataDir, formulario.retencion_dias, new Date(), formulario.ventana_min);
db.close();
console.log(
  `limpieza: ${r.peticiones} peticiones y ${r.ips} IPs borradas (retención ${formulario.retencion_dias} días, ventana ${formulario.ventana_min} min)`,
);
