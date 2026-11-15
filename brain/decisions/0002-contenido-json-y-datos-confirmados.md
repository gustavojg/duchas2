# 0002 — Contenido en JSON validado y regla de datos confirmados en un solo módulo

Estado: aceptada · 2026-11-14

## Contexto

El dueño debe cambiar precios, plazos, reseñas, servicios y fotos sin tocar componentes (historia 10).
El PRD exige no publicar plazos, precios, años ni reseñas sin confirmar, con una tabla vinculante de
textos alternativos, y `{{PENDIENTE}}` visible solo en local.

## Decisión

- Todo el contenido vive en `web/content/*.json`, validado con zod en `web/src/lib/content.ts`; un JSON
  inválido **rompe el build** con un mensaje que dice el fichero y el campo.
- Cada dato comercial es `Dato<T> = { valor, confirmado }`.
- Un único módulo (`dato.ts` + `textos.ts`) decide qué texto se ve: confirmado, alternativo o
  `{{PENDIENTE}}` (modo `pendientes` en `next dev` o con `MOSTRAR_PENDIENTES=1`).
- Los componentes no contienen cifras, plazos, teléfonos ni textos legales literales.

## Alternativas descartadas

- **MDX/Markdown por página**: cómodo para textos largos, pero mezcla datos con texto y no permite
  validar `confirmado` ni reutilizar el mismo dato en varias páginas y en JSON-LD.
- **CMS** (headless o con panel): pospuesto por el PRD («panel de administración» es post-MVP) y puede
  costar dinero.
- **YAML**: más amable de editar pero añade dependencia y ambigüedades de tipos; JSON + README basta.

## Consecuencias

- Cambiar un plazo de «no confirmado» a «confirmado» y regenerar cambia todas las páginas a la vez.
- Los tests pueden inyectar contenido de fixture (`CONTENT_DIR`) y comprobar ambas columnas de la tabla.
- El README debe explicar cada fichero y el campo `confirmado`.
