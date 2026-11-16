/**
 * `pnpm smoke:contacto`: comprueba contra un servidor en marcha (el staging) el contrato de POST /api/contacto:
 * 201 con .eml y foto adjunta, honeypot, 400 por teléfono y GET sin 2xx. Hace 3 envíos que cuentan contra el
 * límite por IP (5 por 60 min). Lee los .eml de DATA_DIR/mail en el disco local.
 */
import { ejecutarSmoke, leerEntornoSmoke } from '../src/smoke/contacto.js';

let entorno;
try {
  entorno = leerEntornoSmoke(process.env);
} catch (e) {
  console.error(`smoke:contacto: ${(e as Error).message}`);
  process.exit(1);
}

console.log(`smoke:contacto contra ${entorno.baseUrl} (DATA_DIR ${entorno.dataDir})`);
if (!entorno.local) {
  console.warn(
    'aviso: BASE_URL no es localhost; DATA_DIR debe ser el del servidor staging, porque los .eml se leen del disco local.',
  );
}

const r = await ejecutarSmoke({ baseUrl: entorno.baseUrl, dataDir: entorno.dataDir }).catch((e: unknown) => {
  console.error(`smoke:contacto: no se ha podido conectar con ${entorno.baseUrl} (${(e as Error).message})`);
  process.exit(1);
});
for (const p of r.pasos) console.log(`${p.ok ? '✔' : '✘'} ${p.nombre}: ${p.detalle}`);
if (!r.ok) process.exit(1);
