# 0006 — Conservación de peticiones: un único valor de retención y borrado automático

Estado: aceptada · 2026-11-14

## Contexto

El formulario recoge datos personales y fotos de viviendas. El PRD exige que la página de privacidad
muestre el plazo de conservación leyendo **el mismo valor** que usa el borrado automático (90 días por
defecto, configurable) y que el borrado ocurra al arrancar y una vez al día.

## Decisión

- `retencion_dias` en `web/content/config.json`, con override por `RETENCION_DIAS`; una sola función
  (`web/src/lib/config.ts`) lo lee, y la usan el build (página de privacidad) y el servidor.
- `borrarCaducadas(db, dataDir, dias, ahora)` borra filas y fotos caducadas y los registros de IP fuera
  de ventana; corre al arrancar, cada 24 h y con `pnpm limpieza`.
- IP solo como HMAC; fotos fuera del directorio público.

## Alternativas descartadas

- **Valor duplicado** (texto en la página y constante en el servidor): se desincronizan.
- **Cron del sistema**: otra pieza que configurar; el proceso único basta para el MVP.

## Consecuencias

- Si se cambia `RETENCION_DIAS` en el servidor hay que regenerar el sitio con el mismo valor; el README
  lo dice y el arranque avisa si el valor del servidor difiere del que se usó en el build (se escribe en
  `web/out/build-info.json`).
