# 0001 — Stack: `node-hono-next` (Next.js estático + Astryx + Hono + SQLite, un proceso)

Estado: propuesto · fuera del catálogo, requiere aprobación humana · 2026-11-14

## Contexto

El PRD fija decisiones que no se reabren: sitio en **React** con **HTML estático por página**, design
system **Astryx** (sin DS propio ni HTML suelto), y la propuesta aceptada nº 2: **Next.js con
exportación estática + un pequeño servicio Node** para el formulario (SMTP, foto, límite por IP), todo
en local y sin servicios de pago. Astryx es beta y solo documenta Next.js y Vite.

Catálogo actual:
- `node-hono-sqlite`: server-rendered con plantillas de Hono (strings/JSX de Hono), **sin React** ⇒ no
  puede usar Astryx (paquete React + StyleX) y contradice «React, HTML estático, Astryx».
- `python-fastapi-next`: Next estático + Astryx 0.7.16 ya integrado, pero el backend es **Python**, su
  `not_when` excluye expresamente SEO y «CRUD sencillo sin lógica en Python (para eso
  node-hono-sqlite es más pequeño)», y el PRD pide un servicio **Node**.

Ninguno sirve tal cual; los dos juntos contienen todas las piezas ya probadas.

## Decisión

Nuevo stack `node-hono-next`, que es la unión de las dos plantillas existentes:
- **Servidor**: lo de `node-hono-sqlite` (Node ≥ 22/24, Hono 4, `@hono/node-server`, `node:sqlite`,
  zod, tsx, vitest sobre `app.request()`), más `nodemailer` para SMTP. Sirve `web/out` con
  `serveStatic` y expone `/health` y `/api/contacto`. **Un proceso, un puerto** (`PORT`, 3000).
- **Web**: lo de `python-fastapi-next/web` (Next 16.4.4 con `output: 'export'`, `trailingSlash`,
  React 19.3.1, Astryx 0.7.16 por CSS precompilado, sin compilador StyleX, tests con
  `renderToStaticMarkup`), como miembro `web/` de un workspace pnpm.
- `pnpm dev` arranca `next dev` (:3000, rewrites a :3001) y Hono (:3001) con `concurrently`;
  `pnpm build` = `next build` + `scripts/seo-build.ts`; `pnpm start` = Hono sirviendo `web/out`.
- Tests: vitest (servidor + lógica + componentes), vitest sobre `web/out` (`test:build`) y Playwright
  (E2E). Todo gratuito.

## Alternativas descartadas

- **`node-hono-sqlite` con Hono JSX**: incompatible con Astryx y con «React»; obligaría a un DS propio.
- **`python-fastapi-next`**: añade Python sin lógica Python, contradice «servicio Node» y su `not_when`.
- **Next con servidor (`next start`, route handlers)**: rompe «HTML estático por página» y la decisión
  aceptada; además mete la lógica del formulario en el runtime de Next.
- **Astro + islas React**: Astryx no documenta Astro (riesgo señalado en la investigación).
- **Dos procesos también en producción** (estático en un host + API aparte): el PRD lo acepta, pero un
  proceso único sirve igual en local/staging y encaja con el formato de la fábrica (un puerto,
  `/health`). Desplegar el front en un CDN sigue siendo posible después (es `web/out`).

## Consecuencias

- Una persona debe aprobar el stack nuevo; la máquina Stack lo construye combinando las dos plantillas.
- El servidor importa lógica pura de `web/src/lib` (validación, config, textos): una sola fuente.
- `setup`/`verify` incluyen `pnpm build`, porque los tests de `web/out` lo necesitan; el build tarda más
  que en `node-hono-sqlite`.
- Lighthouse y Mailpit quedan como comprobaciones manuales (necesitan Chrome/Mailpit).
