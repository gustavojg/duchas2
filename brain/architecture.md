# Arquitectura — Duchas 2

Resumen operativo de `docs/ARCHITECTURE.md` (fuente) y del STACK.md de `node-hono-next`. ADRs en
`brain/decisions/` (copia de `docs/decisions/`).

## Forma
Sitio **estático** Next.js 16 (`output: 'export'`, `trailingSlash: true`) con Astryx 0.7.16, contenido en JSON
editable, servido junto con una pequeña API por **un solo proceso Node con Hono** (un puerto). En `pnpm dev`
hay dos procesos (next dev :3000 con rewrites de `/api` y `/health` a Hono :3001); en build/producción, uno.

```
Navegador ──► Hono (PORT)
               ├── GET  /health          → { ok, app, commit }
               ├── POST /api/contacto    → valida, limita, guarda (SQLite + fotos), envía SMTP
               └── GET  /*               → web/out (HTML estático); 404 → web/out/404.html
```

## Capas y módulos
| Carpeta | Qué va |
|---|---|
| `src/server.ts` | arranque: config, `openDb`, mailer, limpieza al arrancar y cada 24 h, `serve()` |
| `src/app.ts` | `createApp(deps)`: `/health`, monta `src/routes/*` en `/api/<recurso>`, 404 JSON en `/api/*`, y `mountWeb()` el último |
| `src/routes/<recurso>.ts` | router Hono por recurso `(deps) => Hono` (p. ej. `contacto.ts`) |
| `src/domain/<x>.ts` | lógica pura sobre `db`/`now` sin Hono: `foto.ts` (bytes mágicos), `rate-limit.ts`, `limpieza.ts` (`borrarCaducadas`) |
| `src/db.ts` | `openDb` + `MIGRATIONS` (aditivas) |
| `src/mailer.ts` | `createMailer(config)`: `file` (.eml en `DATA_DIR/mail`) o `smtp` |
| `src/config.ts` | único lector de `process.env` (zod) |
| `src/web.ts` | `mountWeb`: estáticos, trailing slash, caché immutable de `/_next/static/*`, 404.html |
| `web/content/*.json` | **ficheros de datos editables**: negocio, config, servicios, plato-ducha, comparativa, faq, resenas, galeria, zonas, referencias, pasos |
| `web/src/lib/*.ts` | lógica PURA compartida web ↔ servidor: `content.ts`, `dato.ts`, `textos.ts`, `contacto.ts` (zod del formulario), `whatsapp.ts`, `seo.ts`, `borrador.ts`, `rutas.ts`/`site.ts`, `config.ts` (retención y límites) |
| `web/src/app/<ruta>/page.tsx` | páginas estáticas (App Router) |
| `web/src/ui/*` | componentes del producto, todos compuestos con Astryx (`Frame`, `Nav`, composiciones de `brain/design.md`, `art.tsx`) |
| `scripts/postbuild.ts` | sitemap.xml, robots.txt y aviso de modo borrador en `web/out` |
| `tests/build/`, `tests/e2e/` | tests sobre `web/out` y Playwright |

## Límites
- `web/src/lib/*` es puro (sin React, Next, Astryx, `window`; `fs` solo en `content.ts`/`config.ts`); lo importan
  las páginas y el servidor (por ruta relativa con `.js`). Validación del formulario, retención y textos: **una sola fuente**.
- `web/src/ui/*` solo usa componentes y tokens de Astryx. Nada de `<div>`/`<span>`, hex, px ni CSS por página.
- `src/` nunca importa de `web/src/ui` ni `web/src/app`.
- Las páginas no leen JSON directamente: piden datos a `content.ts` y textos a `dato.ts`/`textos.ts`.
- Rutas de API solo bajo `/api` (más `/health`) y montadas antes de `mountWeb()`.
- Todo lo externo (db, mailer, now, clientIp, config) entra por `Deps`; nada de singletons.

## Contratos
- `POST /api/contacto` (`multipart/form-data`). Orden: 1) tamaño (`bodyLimit`, foto > `foto_max_mb`) → **413**;
  2) límite por IP en `envios_ip` (5 / 60 min) → **429**; 3) honeypot → **201** sin guardar ni enviar;
  4) zod compartido → **400** `{ error: 'validacion', campos: { campo: mensaje } }`; 5) tipo de foto por bytes
  mágicos (JPEG, PNG, WebP, HEIC) → **415**; 6) guardar foto + fila; 7) email con adjunto; si falla, se borran
  fila y foto y **503** `{ error: 'envio' }`; éxito **201** `{ ok: true }`.
- `GET /health` → `{ ok: true, app, commit }`. `commit` es el commit servido: lo inyecta el staging de la fábrica
  en la variable de entorno `GIT_SHA`, la lee `src/config.ts` (`Config.commit`, recortado; `'desconocido'` si falta
  o está vacía) y llega a `createApp` por `Deps.commit`. `/api/*` desconocido → `{ error: 'not_found' }` 404.
- Teléfono normalizado `+34XXXXXXXXX` (9 dígitos que empiezan por 6-9; admite `+34`/`0034`).
- Enlaces solo con `telLink`/`waLink` (`https://wa.me/<digitos>?text=<encodeURIComponent>`).

## Datos
- Contenido: JSON en `web/content/` con tipo `Dato<T> = { valor: T | null; confirmado: boolean }`.
- SQLite (`DATA_DIR/app.db`), tablas en `MIGRATIONS` de `src/db.ts`:
  - `meta (key PK, value)`.
  - `peticiones (id TEXT PK uuid, creada_en INTEGER ms, nombre, telefono, pieza CHECK IN ('plato_ducha','banera','azulejos','otro'), dano, zona, mensaje, pagina_origen, foto_fichero, foto_mime, foto_bytes, privacidad_aceptada_en, email_enviado_en)`; índice `peticiones_creada_en`.
  - `envios_ip (id INTEGER PK AUTOINCREMENT, ip_hash TEXT HMAC-SHA256 con IP_SALT, creado_en INTEGER ms)`; índice `envios_ip_hash_creado (ip_hash, creado_en)`.
- Fotos en `DATA_DIR/fotos/<id>.<ext>`, fuera de `web/out`: nunca se sirven por HTTP.
- Fechas en ms epoch (`deps.now().getTime()`). Nombres de tablas y columnas en español, snake_case.
- Migraciones: aditivas, al final, nunca editadas.

## Reglas de negocio clave
- Datos confirmados (`dato.ts` + `textos.ts`), modo `pendientes` en dev o `MOSTRAR_PENDIENTES=1`.
- Reseñas: media y número calculados de `resenas.json`, la misma cifra en el bloque y en AggregateRating; sin reseñas, nada.
- Retención: `retencion_dias` (90) en `web/content/config.json` + override `RETENCION_DIAS`; lo leen la página de
  privacidad y `borrarCaducadas` (al arrancar, cada 24 h y `pnpm limpieza`).
- Modo borrador: si faltan razón social, NIF, domicilio, teléfono o plazo de garantía → `noindex` en todo y aviso en el build.
- Cookies: sin `ga4_id` no hay banner ni script; con él, GA4 solo tras «Aceptar».

## Rutas críticas (risk: high)
Cambios aquí SIEMPRE requieren aprobación humana (gate determinista en `brain/risk-paths.txt`):
- `src/db.ts` (migraciones y esquema de datos personales).
- `src/routes/contacto.ts` y `src/domain/` del formulario: `foto.ts`, `rate-limit.ts`, `limpieza.ts` (datos personales, RGPD, abuso).
- `src/config.ts`, `.env*` (secretos SMTP, `IP_SALT`), `src/mailer.ts` (envío de datos de clientes).
- `src/web.ts` y `src/server.ts` (qué se sirve por HTTP: las fotos nunca).
- `web/src/lib/contacto.ts` (validación compartida), `web/src/lib/config.ts` (retención), `web/src/lib/borrador.ts` (noindex), `web/src/lib/dato.ts` y `textos.ts` (promesas comerciales).
- `web/content/negocio.json` y `web/content/config.json` (teléfono único, datos legales, retención).
- Páginas legales `web/src/app/aviso-legal`, `privacidad`, `cookies`; banner de cookies.
- `scripts/postbuild.ts` (robots/noindex), `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `brain/`.
