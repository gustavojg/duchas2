# Convenciones — Duchas 2 (stack `node-hono-next`)

## Código
- TypeScript estricto en todo. Node ≥ 22 (24 en CI), pnpm 11 con workspace (`.` y `web`), un solo `pnpm-lock.yaml`.
- Servidor: Hono + zod, ejecutado con `tsx`. Imports relativos con `.js`.
- Rutas de la API: un módulo por recurso en `src/routes/<recurso>.ts` que exporta `(deps: Deps) => Hono`, montado en
  `createApp` de `src/app.ts` con `app.route('/api/<recurso>', ...)` ANTES de `mountWeb()`. Entradas con
  `z.object(...).safeParse(...)`; respuestas `c.json(...)` con los códigos del contrato (`brain/architecture.md`).
- Dominio en `src/domain/<x>.ts`: funciones puras sobre `db` y `now`, sin Hono.
- Todo lo externo por `Deps` (`db`, `mailer`, `now`, `clientIp`, `config`). `process.env` solo en `src/config.ts`.
- **Migraciones solo en `MIGRATIONS` de `src/db.ts`**: aditivas (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT
  EXISTS`, `ALTER TABLE ... ADD COLUMN`), al final de la lista, nunca se editan ni reordenan. Sin ORM.
- Código compartido web ↔ servidor en `web/src/lib/*.ts`, puro (sin React/Next/Astryx/`node:*`/`window`).
- Contenido editable en `web/content/*.json`, validado con zod en `web/src/lib/content.ts`. Ningún componente
  contiene cifras, plazos, teléfonos ni textos legales literales.
- Errores: la API devuelve `{ error: '<codigo>', ... }` con su estado HTTP; el cliente traduce a textos de `brain/design.md`.
- Dependencias nuevas solo si la spec las pide: servidor `pnpm add`, web `pnpm --filter web add --save-exact`.

## Tests (TDD: primero rojo, luego verde)
- Servidor: `src/**/*.test.ts`, vitest de la raíz sobre **`app.request()`** con `testApp()` de `src/testing.ts`
  (BD `:memory:`, mailer que acumula en `sent`, reloj fijo, IP fija, `WEB_DIR` temporal).
- Dominio: `src/domain/<x>.test.ts`. Lógica pura de la web: `web/src/lib/**/*.test.ts` (vitest de la raíz).
- Componentes/páginas: `web/src/**/*.test.tsx`, vitest de `web/` con `renderToStaticMarkup`; el componente puro
  separado del que hace `fetch`; estados de carga, vacío y error.
- Build: `tests/build/*.test.ts` sobre `web/out` (`pnpm test:build`). E2E: `tests/e2e/*.spec.ts` (Playwright).
- Comandos: `pnpm typecheck && pnpm test` (rápido); `pnpm build && pnpm test:build`; `pnpm e2e`.
- Una tarea está terminada con `pnpm typecheck && pnpm test && pnpm build && pnpm test:build` en verde.

## Git
- Ramas: `sf/<job-id>` para la fábrica; `feature/<x>` para humanos.
- Commits convencionales (`feat:`, `fix:`, `chore:`, `test:`, `docs:`). Un commit por tarea.
- PR: título, descripción con «Qué / Por qué / Cómo probar».

## UI
- Design system **Astryx** (`@astryxdesign/core`, un componente por import). Marco en `web/src/ui/Frame.tsx`,
  aplicado una vez en `web/src/app/layout.tsx`; las páginas solo aportan el cuerpo con un único `Heading level={1}`.
- Tokens: overrides del tema en `web/src/app/globals.css` (selector `[data-astryx-theme="neutral"], … [data-astryx-media]`),
  copia del bloque de `docs/DESIGN.md`. Es el único sitio con hex. Dirección visual y reglas en `brain/design.md`.
- Composiciones propias (cinta, deslizador, pasos…) en `web/src/ui/`, solo con primitivas Astryx y `var(--…)`;
  se registran en `docs/astryx-componentes.md` (D0). Ilustraciones SVG en `web/src/ui/art.tsx`.
- Ninguna vista escribe `<div>`, `<span>`, `<style>`, `style={{}}`, colores, tamaños ni fuentes sueltos.
- Navegación en `NAV` (`web/src/config.ts`); páginas públicas en `PAGES` (`web/src/lib/site.ts`).
- Texto en español, «tú», frases cortas, sin jerga técnica.
