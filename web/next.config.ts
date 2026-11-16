import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

/**
 * Build: exportación estática a web/out, que sirve Hono (src/web.ts): un proceso, un puerto.
 * Dev (`pnpm dev` en la raíz): next dev en :3000 con recarga en caliente; /api y /health van al servidor
 * Hono en :3001 (`tsx watch`).
 *
 * NEXT_DIST_DIR (opcional, solo build): con `output: 'export'` un `distDir` propio es el destino del export
 * (docs de Next, «Static Exports»: `out` -> `dist`; los artefactos siguen en .next). Lo usa
 * tests/build/construir-fixture.ts para exportar a web/out-fixture sin tocar web/out. Sin la variable no se
 * pasa `distDir` y el export va a web/out.
 *
 * Astryx: sin plugin de StyleX ni babel.config. Los componentes de @astryxdesign/core vienen precompilados
 * en astryx.css (ruta «Plain CSS» de `npx astryx docs styling-overview`), que importa src/app/globals.css.
 */
export default function config(phase: string): NextConfig {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    const api = process.env.API_URL ?? 'http://127.0.0.1:3001';
    return {
      async rewrites() {
        return [
          { source: '/api/:path*', destination: `${api}/api/:path*` },
          { source: '/health', destination: `${api}/health` },
        ];
      },
    };
  }
  const distDir = process.env.NEXT_DIST_DIR;
  return { output: 'export', trailingSlash: true, images: { unoptimized: true }, ...(distDir ? { distDir } : {}) };
}
