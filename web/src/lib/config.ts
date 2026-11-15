/**
 * Única fuente de la configuración del formulario (retención de fotos y límites): web/content/config.json con
 * override por variables de entorno (RETENCION_DIAS, FOTO_MAX_MB, LIMITE_ENVIOS, VENTANA_MIN). La leen las
 * páginas (texto de retención) y el servidor (borrado y límites). Sin React ni Next.
 */
import { z } from 'zod';
import { leerContenido } from './content.ts';

const positivo = z.number().int().positive();

export const configSchema = z
  .object({ retencion_dias: positivo, foto_max_mb: positivo, limite_envios: positivo, ventana_min: positivo })
  .strict();

export type ConfigFormulario = z.infer<typeof configSchema>;

const OVERRIDES: Record<keyof ConfigFormulario, string> = {
  retencion_dias: 'RETENCION_DIAS',
  foto_max_mb: 'FOTO_MAX_MB',
  limite_envios: 'LIMITE_ENVIOS',
  ventana_min: 'VENTANA_MIN',
};

export function configFormulario(env: Record<string, string | undefined> = process.env): ConfigFormulario {
  const config = { ...leerContenido('config.json', configSchema) };
  for (const [campo, variable] of Object.entries(OVERRIDES) as [keyof ConfigFormulario, string][]) {
    const raw = env[variable];
    if (raw === undefined || raw === '') continue;
    if (!/^\d+$/.test(raw.trim()) || Number(raw) <= 0) {
      throw new Error(`${variable} debe ser un entero positivo (vale «${raw}»)`);
    }
    config[campo] = Number(raw);
  }
  return config;
}
