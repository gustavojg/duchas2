# Arquitectura

## Capas y módulos
Describe las capas (p. ej. web → api → dominio → datos) y qué va en cada carpeta.

## Límites
Qué módulo puede importar a cuál. Qué está prohibido.

## Contratos
APIs, eventos, esquemas compartidos. Dónde están definidos.

## Datos
Modelo de datos principal, migraciones, convenciones de nombres.

## Rutas críticas (risk: high)
Cambios en estas rutas SIEMPRE requieren aprobación humana:
- migrations/
- auth/
- payments/
- infra/
- .github/
- brain/
