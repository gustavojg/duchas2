# Diseño

Dirección visual del producto. La fija la máquina de Diseño (docs/DESIGN.md) y la aplica el bootstrap en
`src/ui/theme.ts`. Toda entrega que toque pantallas la cumple; el revisor de UI la comprueba con capturas.

## Intención
- Para quién es (persona concreta, no "usuarios") y en qué momento abre la herramienta.
- Qué debe conseguir (el verbo). Qué manda en cada pantalla y qué se esconde.
- Cómo debe sentirse, en palabras con significado (no "limpio y moderno").

## Competencia y tendencias (docs/COMPETENCIA.md)
- Qué webs compiten por el mismo cliente: qué cuentan, qué señales de confianza dan, cómo se contacta, sus paletas y tipografías.
- Plan de contenido: qué cuenta cada pantalla principal y en qué orden; qué respondemos que la competencia no responde.
- Ficha del encargo: tipo de web, industria y objetivo medible.
- Páginas y módulos: el objetivo y el tipo de cada módulo (posicionar, confianza, mostrar resultados, convertir, informar) y su orden.
- Plantillas, páginas y paletas de la industria (con URL) de las que parte cada página y módulo, y qué se adaptó.
- En qué nos parecemos a la categoría (para parecer serios) y en qué nos diferenciamos (para que nos recuerden).

## Mundo del producto
- Conceptos y vocabulario del dominio que la interfaz usa.
- Colores que existen en ese mundo y de dónde salen los tokens, contrastados con el mapa de paletas de la competencia.
- Firma: el elemento visual o estructural que solo podría existir en este producto, y dónde aparece.
- Defaults rechazados y qué los sustituye.

## Imágenes y señales de confianza
- Qué foto, ilustración o gráfico lleva cada pantalla principal y de dónde sale; qué se ve mientras no exista.
- Qué datos reales del cliente se muestran (años, registro, zonas, reseñas, garantías) y dónde.

## Tokens (src/ui/theme.ts)
- Superficies `--surface-0..2`, texto `--ink-1..4`, bordes `--edge-1..3`, acento `--brand`, semánticos `--ok/--warn/--bad`.
- Tipografía `--font` / `--font-mono` y escala `--text-*`. Unidad de espaciado `--space` y radios `--radius-*`.
- Profundidad: bordes y superficies; `--shadow-1` solo donde DESIGN.md la define. Un acento, más `--brand-2` si DESIGN.md le da un único uso. Sin degradados.

## Componentes (src/ui/components.ts y clases de src/ui/base.ts)
- Marco: `page()` con marca, `nav()` y contexto de usuario (`who`). Ninguna pantalla sin navegación salvo las públicas de un solo paso.
- `pageHead`, `card`, `table` (celdas `cell-free`/`cell-busy`/`cell-block`), `field`+`input`, `button` (un `primary` por pantalla; `quiet`, `ghost`, `danger`), `badge`, `alert`, `empty`, `stat`, `kv`.
- Estados obligatorios: vacío, error y confirmación en toda pantalla con datos o formulario.

## Reglas para las entregas
1. Las vistas componen con los componentes y las clases del design system. Nada de `<style>` ni colores, tamaños o fuentes sueltos.
2. Si falta un componente, se añade a `src/ui/components.ts` con sus tokens, no se improvisa en la vista.
3. Texto en español, frases cortas, sin jerga técnica de cara al usuario.
4. Móvil primero en tablas anchas: `table-wrap` y columnas clave.
