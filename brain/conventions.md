# Convenciones

## Código
- Lenguaje, versión, formateador, linter.
- Estructura de un módulo nuevo.
- Manejo de errores.

## Tests
- TDD: primero el test en rojo, luego el código.
- Qué se testea con unit, integración y E2E. Comando para cada uno.

## Git
- Ramas: sf/<job-id> para la fábrica; feature/<x> para humanos.
- Commits: convencionales (feat:, fix:, chore:).
- PR: título, descripción con "Qué / Por qué / Cómo probar".

## UI
- Design system en `src/ui/` (tokens en theme.ts, componentes en components.ts). Reglas y dirección visual en `brain/design.md`.
- Ninguna vista escribe estilos ni colores propios; si falta un componente, se añade al design system.
