# 0004 — Astryx 0.7.16 por CSS precompilado y validación D0 como primera tarea

Estado: aceptada · 2026-11-14

## Contexto

Astryx es beta; la investigación no pudo fijar versión ni confirmar acordeón, deslizador ni campos de
formulario. El PRD (D0) exige fijar versión, listar componentes con la CLI y documentar en
`docs/astryx-componentes.md` qué componente o composición cubre cada pieza, antes de F1, F2, F4 y F5.
La plantilla `python-fastapi-next` de la fábrica ya usa Astryx **0.7.16** (174 componentes) con
Next 16.4.4 por la ruta «Plain CSS», sin compilador StyleX.

## Decisión

- Fijar `@astryxdesign/core`, `@astryxdesign/theme-neutral` y `@astryxdesign/cli` a **0.7.16** exactos.
- Importar en `globals.css` `reset.css`, `astryx.css` y el tema neutral; fuente Figtree autoalojada
  (`@fontsource-variable/figtree`). Sin `babel.config` (rompería SWC/`next/font`) y sin StyleX propio.
- D0 es la **primera tarea** del plan: con la CLI (`npx astryx search`, `component`) se rellena
  `docs/astryx-componentes.md`. Para lo que falte, componente propio en `web/src/ui/` compuesto con
  primitivas y tokens de Astryx, envolviendo el control nativo mínimo. Si ni así, parar y preguntar.
- Un test de vitest impide hex, px, rem, `style=` y `<div>/<span>` sueltos en `web/src`.

## Alternativas descartadas

- **Compilador StyleX** (`@stylexswc/nextjs-plugin`): solo necesario si se escribe `stylex.create()`;
  añade riesgo de build sin beneficio para el MVP.
- **Otra librería para el deslizador o el acordeón**: sería un segundo DS; la visión lo prohíbe.
- **Última versión de Astryx sin probar**: la 0.7.16 ya funciona en la fábrica con la misma versión de
  Next.

## Consecuencias

- El riesgo de Astryx se resuelve en la primera tarea y no a mitad de F1.
- Subir de versión exige `npx astryx upgrade --from 0.7.16 --apply` y repetir la tabla de D0.
