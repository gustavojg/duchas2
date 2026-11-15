# Arquitectura — Duchas 2

Fecha: 2026-11-14 · Basada en `docs/PRD.md` (revisión 1) y `docs/research.md`.
Stack: **`node-hono-next`** (propuesto, fuera del catálogo; ver `docs/decisions/0001-stack.md`).

## 1. Forma de la app en una frase

Un sitio comercial **estático** generado con Next.js 16 (`output: 'export'`) y React 19 con el design
system **Astryx 0.7.16**, cuyo contenido sale de ficheros JSON editables, servido junto con una pequeña
API de formulario por **un solo proceso Node con Hono** (un puerto), que guarda las peticiones en
**SQLite** y las fotos en disco, envía el email por **SMTP** (Mailpit en local) y borra lo caducado.

```
Navegador ──► Hono (PORT=3000)
               ├── GET  /health                 → { ok, app, commit }
               ├── POST /api/contacto           → valida, limita, guarda (SQLite + fotos), envía SMTP
               └── GET  /*                      → ficheros de web/out (HTML estático de Next)
```

En desarrollo hay dos procesos (`next dev` en :3000 con rewrites de `/api/*` y `/health` a Hono en
:3001); en build/staging/producción hay **uno**.

## 2. Estructura del repositorio y capas

```
/                         raíz pnpm (workspace: ".", "web")
├── src/                  SERVIDOR (Hono). Solo TypeScript, sin React.
│   ├── server.ts         arranque: openDb, mailer, limpieza al arrancar + cada 24 h, serve()
│   ├── app.ts            createApp(deps) → Hono: /health ({ ok, app, commit }), /api/contacto, estáticos y 404
│   ├── db.ts             openDb + MIGRATIONS (aditivas, como la plantilla)
│   ├── contacto.ts       handler de POST /api/contacto (orquesta los módulos de abajo)
│   ├── foto.ts           detección de tipo por bytes mágicos, guardado en DATA_DIR/fotos
│   ├── rate-limit.ts     ventana deslizante por IP (hash) en SQLite
│   ├── mailer.ts         interfaz Mailer + impl. nodemailer (smtp | file) + fake para tests
│   ├── limpieza.ts       borrarCaducadas(db, dataDir, dias, ahora)
│   └── config.ts         lee env + web/content/config.json (vía web/src/lib/config.ts)
├── web/                  SITIO (Next 16 export estático + Astryx)
│   ├── content/          *** FICHEROS DE DATOS EDITABLES *** (JSON, ver §4)
│   ├── public/fotos/     fotos WebP ya optimizadas (salida de `pnpm fotos`)
│   ├── src/lib/          LÓGICA PURA COMPARTIDA (sin React, sin APIs de navegador):
│   │   ├── content.ts    carga + valida con zod todos los JSON de content/ (falla el build si no valida)
│   │   ├── dato.ts       regla de datos confirmados: texto(dato, modo) → confirmado | alternativo | {{PENDIENTE}}
│   │   ├── textos.ts     tabla vinculante de textos alternativos del PRD
│   │   ├── contacto.ts   esquema zod del formulario, normalizarTelefono, límites (lo usan web y server)
│   │   ├── whatsapp.ts   waLink(numero, mensaje), telLink(numero), mensajePorRuta(ruta)
│   │   ├── seo.ts        metadata por página + JSON-LD (LocalBusiness, Service, FAQPage, BreadcrumbList, AggregateRating)
│   │   ├── borrador.ts   datosFaltantes(negocio) → lista; esBorrador()
│   │   ├── rutas.ts      lista canónica de todas las rutas del sitio (sitemap, tests, E2E)
│   │   └── config.ts     config del formulario (retención, límites) = config.json + override por env
│   ├── src/app/          páginas (App Router), una carpeta por ruta de §5
│   ├── src/ui/           componentes del producto, todos compuestos con Astryx (ver docs/astryx-componentes.md)
│   └── next.config.ts    export estático en build, rewrites a :3001 en dev (como la plantilla python-fastapi-next)
├── scripts/
│   ├── seo-build.ts      postbuild: sitemap.xml y robots.txt en web/out, aviso de modo borrador por consola
│   ├── fotos.ts          originales → WebP 1200×900 y 600×450 (sharp) en web/public/fotos
│   └── limpieza.ts       ejecuta la limpieza a mano (`pnpm limpieza`)
├── tests/build/          tests sobre web/out ya generado (teléfono único, noindex, sitemap…)
├── e2e/                  Playwright contra el proceso único ya construido
└── docs/                 PRD, arquitectura, ADRs, astryx-componentes.md
```

Reglas de dependencia entre capas:
- `web/src/lib/*` es puro (sin React, sin `window`, sin `fs` salvo `content.ts`/`config.ts`) y lo
  importan **las dos** partes: las páginas de Next y el servidor (`src/` lo importa por ruta relativa;
  `tsx` lo resuelve). Así la validación del formulario, el plazo de retención y los textos son **una
  sola fuente**.
- `web/src/ui/*` solo usa componentes y tokens de Astryx. Nada de `<div>`/`<span>` sueltos, hex, px ni
  CSS por página (regla de la plantilla Astryx y criterio de D0).
- `src/` (servidor) nunca importa de `web/src/ui` ni de `web/src/app`.
- Las páginas no leen JSON directamente: piden datos a `content.ts` y textos a `dato.ts`/`textos.ts`.

## 3. D0 — puerta de Astryx (primera tarea, bloquea F1, F2, F4, F5)

- Versión fijada exacta: `@astryxdesign/core`, `@astryxdesign/theme-neutral`, `@astryxdesign/cli`
  **0.7.16** (la misma que la plantilla `python-fastapi-next`, que ya funciona con Next 16.4.4).
- Estilos por la ruta «Plain CSS» precompilada (`globals.css` importa `reset.css`, `astryx.css` y el
  tema), **sin compilador StyleX**. Fuente Figtree autoalojada con `@fontsource-variable/figtree`.
- El builder ejecuta `npx astryx search <pieza>` / `npx astryx component <Nombre>` para cada pieza del
  PRD (botón, enlace, tarjeta, titular/texto, layout/stack, acordeón, deslizador antes/después, campo de
  texto, select, casilla, archivo, textarea, error de campo, banner, imagen, migas de pan) y escribe
  `docs/astryx-componentes.md` con versión y una fila por pieza: «componente Astryx: X» o «composición
  con primitivas: NombreLocal (primitivas usadas)».
- Fallback aprobado por el PRD: componente propio en `web/src/ui/` compuesto con primitivas Astryx y
  tokens, envolviendo el nativo mínimo (`input type=range|file`, `select`). Si ni así, se para y se
  pregunta (pregunta abierta 13).
- Test de guarda (vitest): ningún fichero de `web/src/**/*.{ts,tsx,css}` contiene `#[0-9a-f]{3,8}`,
  `\d+px`, `\d+rem`, `style=` ni `<div`/`<span` (salvo los ficheros de composición listados en
  `astryx-componentes.md`, que solo pueden usar `var(--…)`).

## 4. Modelo de datos

### 4.1 Contenido (ficheros JSON en `web/content/`, validados con zod en el build)

Tipo base de la regla de datos confirmados:

```ts
type Dato<T> = { valor: T | null; confirmado: boolean };
```

| Fichero | Contenido |
|---|---|
| `negocio.json` | `marca: Dato<string>`, `telefono: Dato<string>` (E.164, uno solo), `whatsapp: Dato<string>`, `email: Dato<string>`, `email_destino` (a quién llegan las peticiones), `horario: Dato<string>`, `legal: { razon_social, nif, domicilio: Dato<string> }`, `anios: Dato<number>`, `garantia: { anios: Dato<number>, condiciones: Dato<string> }`, `plazos: { presupuesto, respuesta, reparacion, uso_ducha: Dato<string> }`, `url_base`, `analitica: { ga4_id: string \| null }` |
| `config.json` | `formulario: { retencion_dias: 90, foto_max_mb: 10, limite_envios: 5, ventana_min: 60 }` |
| `servicios.json` | lista ordenada: `slug, nombre, ruta, tipo: 'principal'\|'servicio'\|'empresas', orden, resumen, problema, como (pasos), precio_desde: Dato<number>, faqs: [{p, r}], relacionados: [slug], whatsapp_mensaje, seo: {title, description}, imagen_tarjeta` |
| `plato-ducha.json` | contenido extra de F2: `h1, danos: [{id, titulo, texto}]` (grieta, golpe, desconchón, perforación, manchas, pérdida de brillo), `antideslizante, cambio_color, materiales: [{nombre, reparable: Dato<boolean>}], proceso, faqs` (≥5) |
| `comparativa.json` | «¿Reparar o cambiar?»: filas `coste, tiempo, obra` con `reparar: Dato<string>` y `cambiar: Dato<string>` (+ fuente) |
| `faq.json` | `temas: [{tema, preguntas: [{p, r, en_portada: bool}]}]` |
| `resenas.json` | `[{autor, nota 1-5, texto, fecha, fuente}]` (vacío ⇒ sin bloque y sin AggregateRating) |
| `galeria.json` | `[{servicio: slug, antes, despues, alt_antes, alt_despues, hueco?: 'qué foto va'}]` |
| `zonas.json` | `{ madrid_capital: [distritos], municipios: [..] }` |
| `referencias.json` | referencias de hoteles/comunidades (vacío ⇒ sin bloque) |
| `pasos.json` | los 4 pasos de «cómo trabajamos» con la clave de plazo que usa cada uno |

Los textos con plazo se escriben como plantillas con la clave del dato (p. ej. `{plazos.presupuesto}`);
`dato.ts` decide qué texto sale. Añadir un servicio = añadir un objeto en `servicios.json` (+ fotos).

### 4.2 Base de datos SQLite (`DATA_DIR/app.db`, módulo `node:sqlite`)

| Tabla | Columnas |
|---|---|
| `meta` | `key TEXT PRIMARY KEY`, `value TEXT NOT NULL` (de la plantilla) |
| `peticiones` | `id TEXT PRIMARY KEY` (uuid), `creada_en INTEGER NOT NULL` (ms epoch), `nombre TEXT NOT NULL`, `telefono TEXT NOT NULL` (normalizado `+34XXXXXXXXX`), `pieza TEXT NOT NULL CHECK (pieza IN ('plato_ducha','banera','azulejos','otro'))`, `dano TEXT`, `zona TEXT`, `mensaje TEXT`, `pagina_origen TEXT`, `foto_fichero TEXT` (nombre en `DATA_DIR/fotos/`, NULL si no hay), `foto_mime TEXT`, `foto_bytes INTEGER`, `privacidad_aceptada_en INTEGER NOT NULL`, `email_enviado_en INTEGER` |
| `envios_ip` | `id INTEGER PRIMARY KEY AUTOINCREMENT`, `ip_hash TEXT NOT NULL` (HMAC-SHA256 de la IP con `IP_SALT`), `creado_en INTEGER NOT NULL`; índice `(ip_hash, creado_en)` |

Índice `peticiones(creada_en)` para la limpieza. Fotos en `DATA_DIR/fotos/<id>.<ext>` (fuera de
`web/out`; nunca se sirven por HTTP).

## 5. Rutas HTTP

Todas son públicas (no hay usuarios ni panel en el MVP). Las páginas son HTML estático generado en el
build; trailing slash activado (`/tarifas/` → `web/out/tarifas/index.html`).

### 5.1 Servidor (Hono)

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/health` | `{ ok: true, app, commit }` (staging). `commit` sale de la variable de entorno `GIT_SHA` (la inyecta el staging de la fábrica; `src/config.ts` la lee recortada como `Config.commit` y llega a `createApp` por `Deps.commit`); vale «desconocido» si falta o está vacía |
| POST | `/api/contacto` | `multipart/form-data`; ver §6.3. Respuestas 201 / 400 / 413 / 415 / 429 / 503 |
| GET | `/_next/static/*` | estáticos con `Cache-Control: public, max-age=31536000, immutable` |
| GET | `/*` | fichero de `web/out`; si no existe, `web/out/404.html` con **404** |

### 5.2 Páginas (Next, estáticas)

| Ruta | Muestra | PRD |
|---|---|---|
| `/` | hero (titular + Llamar + WhatsApp), franja de confianza, catálogo (plato primero), 4 pasos, antes/después con deslizador, precios «desde», reseñas, ¿reparar o cambiar?, FAQ resumida (4-6), zonas, formulario; JSON-LD LocalBusiness (+AggregateRating si hay reseñas) | F1 |
| `/platos-de-ducha/` | página larga SEO: H1 con «plato de ducha» y «Madrid», migas, daños, antideslizante, cambio de color, materiales, proceso, precio orientativo, ¿reparar o cambiar? resumido, galería del servicio, FAQ (≥5), CTA; JSON-LD Service + FAQPage + BreadcrumbList | F2 |
| `/servicios/[slug]/` | 8 páginas generadas con `generateStaticParams` desde `servicios.json` (tipo `servicio`): problema, cómo, precio/alternativo, antes/después, 2-4 FAQ, CTAs, 2-3 relacionados; Service + BreadcrumbList | F3 |
| `/hoteles-y-comunidades/` | misma plantilla de servicio (tipo `empresas`) + bloque de referencias (si hay) + WhatsApp para empresas | F3 |
| `/preguntas-frecuentes/` | todas las FAQ por tema, desplegables; FAQPage | F4 |
| `/tarifas/` | tabla «desde» por trabajo + nota «precio orientativo…»; alternativo si no confirmado | F4 |
| `/antes-y-despues/` | galería con filtro por servicio (estado de cliente); huecos con «qué foto va» | F4 |
| `/quienes-somos/` | forma de trabajar, años (si confirmados), garantía según tabla | F4 |
| `/zonas/` | Madrid capital + municipios | F4 |
| `/contacto/` | teléfono, WhatsApp, email, horario y formulario | F4/F5 |
| `/aviso-legal/`, `/privacidad/`, `/cookies/` | datos legales de `negocio.json`; privacidad con retención leída de `config.ts` | F4 |
| `/404` | página no encontrada con CTAs | — |
| `/sitemap.xml`, `/robots.txt` | ficheros generados por `scripts/seo-build.ts` desde `rutas.ts` | F4 |

Comunes a todas: cabecera con menú, pie con legales, **botón flotante de WhatsApp** (cliente,
`usePathname()` → `mensajePorRuta`), title/description/canonical/Open Graph únicos (`seo.ts`), `noindex`
en modo borrador, banner de cookies solo si `ga4_id`.

## 6. Reglas de negocio clave

### 6.1 Datos confirmados (vinculante, PRD «Regla común»)
- `texto(dato, modo)`: si `confirmado && valor` → texto confirmado; si no → texto alternativo de
  `textos.ts` (tabla del PRD). `modo = 'pendientes'` muestra `{{PENDIENTE}}` en lugar del alternativo
  donde la tabla lo prevé. `modo` es `pendientes` en `next dev` o si `MOSTRAR_PENDIENTES=1` en el build;
  `publico` en el build normal.
- Años sin confirmar ⇒ no se pinta nada. Garantía sin plazo ⇒ «Garantía por escrito» (+`{{PENDIENTE}}`
  en modo pendientes). Precio sin confirmar ⇒ «Pide presupuesto gratuito» (+ botón WhatsApp en el bloque
  de precios). Materiales con `reparable` no confirmado no aparecen como reparables.
- Reseñas: nota media y número calculados de `resenas.json`; el mismo valor alimenta el bloque visible y
  `AggregateRating`. Sin reseñas, ni bloque ni AggregateRating.
- Ningún componente contiene cifras, plazos ni teléfonos literales: todo pasa por `content.ts`.

### 6.2 Contacto único
- Un teléfono y un WhatsApp en `negocio.json`; `telLink`/`waLink` son la única forma de construir
  enlaces. `waLink` usa `https://wa.me/<digitos>?text=<encodeURIComponent(mensaje)>`.
- `waLink` y `telLink` **lanzan** un `Error` ante un número inválido: antes de pintar un botón de
  contacto se comprueba `esNumeroValido(numero)` y, si da `false`, no se pinta (ver §10 «Contratos»).
- Mensajes precargados: por página de servicio (`whatsapp_mensaje`), plato de ducha (menciona la página y
  pide la foto), empresas, confirmación del formulario, y uno por defecto.

### 6.3 Formulario (`POST /api/contacto`)
Orden de procesamiento (cada paso corta la petición):
1. **Tamaño**: `bodyLimit` de Hono a `foto_max_mb` + 1 MB de margen para campos ⇒ **413**. Además, si
   la foto supera `foto_max_mb` ⇒ **413**.
2. **Límite por IP**: se registra el intento en `envios_ip`; si ya hay `limite_envios` (5) intentos de esa
   IP en los últimos `ventana_min` (60) minutos ⇒ **429**, sin guardar ni enviar. IP de
   `getConnInfo`; `X-Forwarded-For` solo si `TRUST_PROXY=1`.
3. **Honeypot** (`campo web`, oculto con Astryx/`aria-hidden`, `tabindex=-1`): relleno ⇒ **201**
   idéntico al de éxito, sin guardar ni enviar.
4. **Validación** con el esquema zod compartido (`web/src/lib/contacto.ts`): `nombre` 1-100 obligatorio;
   `telefono` obligatorio, se quitan espacios/puntos/guiones, se admite `+34`/`0034` y deben quedar
   9 dígitos que empiecen por 6, 7, 8 o 9; `pieza` ∈ enum; `dano` opcional (enum de daños o «otro»);
   `zona` ≤100; `mensaje` ≤2000; `privacidad` = `on` obligatoria; `pagina_origen` opcional. Error ⇒
   **400** `{ error: 'validacion', campos: { <campo>: '<mensaje en español>' } }`.
5. **Foto** (opcional, una): tipo por **bytes mágicos**, no por el `Content-Type` (JPEG `FF D8 FF`, PNG
   `89 50 4E 47`, WebP `RIFF….WEBP`, HEIC/HEIF `ftyp` con marca `heic|heix|hevc|mif1|msf1`). Otro ⇒ **415**.
6. **Guardar** foto en `DATA_DIR/fotos/<id>.<ext>` y fila en `peticiones`.
7. **Email** a `email_destino` con todos los campos y la foto adjunta. Si el envío SMTP falla: se borran
   la fila y la foto (no queda una petición que la empresa no ha visto) y se responde **503**
   `{ error: 'envio' }`. Éxito ⇒ `email_enviado_en` y **201** `{ ok: true }`.

Lado cliente (componente `FormularioContacto`, `'use client'`): misma validación zod antes de enviar,
aviso de 10 MB y de tipo antes de enviar, `accept="image/jpeg,image/png,image/webp,image/heic,.heic"`
(cámara o galería), errores junto al campo; mapeo de respuestas: 400 → errores por campo, 413/415 →
mensajes exactos del PRD, 429 → «Has enviado varias peticiones; llámanos o escríbenos por WhatsApp» con
ambos botones, 5xx o red caída → error con teléfono y WhatsApp **sin vaciar el formulario**, 201 →
confirmación con plazo de respuesta (tabla) y botón de WhatsApp.

### 6.4 Conservación y borrado (RGPD)
- `retencion_dias` (por defecto 90) vive en `web/content/config.json`, con override por la variable
  `RETENCION_DIAS`; `web/src/lib/config.ts` es la única función que lo lee y la usan **la página de
  privacidad (en el build) y el servidor**. Cambiar el valor y regenerar cambia el texto.
- `borrarCaducadas` elimina filas de `peticiones` con `creada_en < ahora - dias` y sus ficheros de foto,
  y filas de `envios_ip` más viejas que la ventana. Se ejecuta al arrancar y cada 24 h (`setInterval`
  con `unref`), y a mano con `pnpm limpieza`. Con `dias = 0` borra todo lo anterior a `ahora`.
- La IP nunca se guarda en claro (HMAC con `IP_SALT`).

### 6.5 Modo borrador y SEO
- `datosFaltantes(negocio)` lista lo no confirmado entre: razón social, NIF, domicilio, teléfono,
  garantía (plazo). Si la lista no está vacía, el layout raíz emite `robots: noindex, nofollow` en todas
  las páginas y `scripts/seo-build.ts` imprime `⚠ MODO BORRADOR: faltan …`. Con todo completo, ni
  `noindex` ni aviso.
- `sitemap.xml` (todas las rutas de `rutas.ts`, con `url_base`) y `robots.txt` (`Allow: /` + `Sitemap:`)
  se generan en postbuild; no se usa la ruta dinámica `sitemap.ts` de Next.
- Un H1 por página; canonical absoluto con `url_base`; Open Graph por página.

### 6.6 Cookies
- Sin `ga4_id` ⇒ no hay banner ni script. Con `ga4_id` ⇒ `BannerCookies` con «Aceptar» y «Rechazar» del
  mismo componente y variante; GA4 se inyecta solo tras «Aceptar»; la elección se guarda en
  `localStorage` (técnica, sin consentimiento).

## 7. Configuración (variables de entorno)

| Variable | Defecto | Uso |
|---|---|---|
| `PORT` / `HOST` | `3000` / `127.0.0.1` | servidor |
| `DATA_DIR` | `./data` | `app.db` y `fotos/` |
| `WEB_DIR` | `./web/out` | estáticos servidos |
| `RETENCION_DIAS`, `FOTO_MAX_MB`, `LIMITE_ENVIOS`, `VENTANA_MIN` | `config.json` | límites F5 |
| `MAIL_TRANSPORT` | `smtp` | `smtp` o `file` (escribe `.eml` en `DATA_DIR/outbox`, para E2E) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | `127.0.0.1`, `1025` (Mailpit) | email |
| `IP_SALT` | aleatorio por arranque si falta (aviso por consola) | hash de IP |
| `TRUST_PROXY` | `0` | leer `X-Forwarded-For` |
| `MOSTRAR_PENDIENTES` | `0` | build con `{{PENDIENTE}}` visibles |
| `CONTENT_DIR` | `./web/content` | carpeta de JSON que lee `content.ts` (tests de build con fixtures) |
| `GIT_SHA` | «desconocido» si falta | commit servido en `/health` |

## 8. Estrategia de tests

`pnpm test` (vitest) — servidor y lógica, sin red ni navegador:
- **Servidor sobre `app.request()`** con `createApp({ db: openDb(':memory:'), mailer: fakeMailer,
  dataDir: tmp, config, ahora: () => t, ipDe: () => '1.2.3.4' })`:
  - `/health` 200, también con `commit` (es «desconocido» sin `GIT_SHA`); ruta inexistente → 404 con HTML; `/tarifas/` sirve el `index.html` de un `WEB_DIR` de
    fixture.
  - `/api/contacto`: 201 válido (fila en BD, foto en disco, 1 email con adjunto y todos los campos);
    400 por nombre vacío, teléfono inválido (`12345`, `5xxxxxxxx`), sin privacidad — con el campo en
    `campos`; teléfonos válidos `612345678`, `+34 612 34 56 78`, `0034912345678`; 413 con foto de 10 MB+1;
    415 con un PDF renombrado a `.jpg`; HEIC aceptado; honeypot → 201 sin fila ni email; 5 envíos → 201 y
    el 6º → 429 sin fila ni email; avanzando el reloj 61 min → 201 otra vez; mailer que lanza → 503 sin
    fila ni foto.
  - `borrarCaducadas`: con días 0 / petición antigua desaparecen fila y foto; la reciente sigue.
- **Lógica pura de `web/src/lib`**: `texto()` en las dos columnas de cada fila de la tabla del PRD y en
  modo pendientes; `normalizarTelefono`; `waLink` (codificación); `datosFaltantes`; JSON-LD (FAQPage con
  las mismas preguntas que la página, AggregateRating ausente sin reseñas y con la media correcta);
  `content.ts` valida los JSON reales del repo; `rutas.ts` incluye una ruta por servicio.
- **Componentes y páginas** con `renderToStaticMarkup` (como la plantilla `python-fastapi-next`):
  primera tarjeta = plato de ducha; 4 pasos en orden y textos según confirmado/no confirmado (cambiando
  el contenido inyectado, sin tocar componentes); un servicio añadido en un fixture genera tarjeta;
  bloque de reseñas/referencias ausente con lista vacía; un único H1; sin estilos sueltos.
- **Guarda de estilos** de D0 (§3).

`pnpm test:build` (vitest sobre `web/out` tras `pnpm build`):
- Todas las rutas de `rutas.ts` existen como HTML; `sitemap.xml` las contiene; `robots.txt` existe.
- En todos los HTML, cualquier número con forma de teléfono español es el de `negocio.json`.
- Con el contenido de ejemplo (datos legales sin confirmar) todas las páginas llevan `noindex`; con un
  `negocio.json` completo de fixture (build con `CONTENT_DIR` de fixture), ninguna.
- Title, description y canonical únicos por página; JSON-LD parseable en cada página que lo declara.
- Sin `ga4_id` no hay script de GA ni banner.

`pnpm e2e` (Playwright, Chromium, contra `pnpm start` con `MAIL_TRANSPORT=file`):
- Móvil 360×740: titular, «Llamar» y «WhatsApp» visibles sin scroll y ≥ 44×44 px; `href` `tel:` y
  `https://wa.me/`.
- Sin scroll horizontal en 320, 360, 768, 1024 y 1440 px en todas las rutas.
- Deslizador antes/después: arrastre táctil y flechas del teclado cambian su valor.
- FAQ: abrir/cerrar con clic y con Enter/Espacio.
- Galería: filtrar por servicio muestra solo sus fotos.
- Formulario: errores junto al campo sin enviar; envío con foto → confirmación y `.eml` en outbox con
  adjunto; foto > 10 MB → aviso antes de enviar; servidor parado → error con teléfono y WhatsApp y
  campos conservados.
- Botón flotante de WhatsApp presente en todas las rutas con mensaje distinto en servicio vs portada.
- Banner de cookies: con un build con `ga4_id`, GA4 no se pide hasta «Aceptar».

Manual / fuera de `verify`: Lighthouse móvil ≥ 90 (`pnpm lighthouse` con el paquete `lighthouse` contra
el servidor local, portada, platos de ducha y FAQ); validador de schema.org; recepción en Mailpit con
`MAIL_TRANSPORT=smtp`.

## 9. Límites (lo que NO se construye en el MVP)

- Sin páginas por distrito/municipio, sin panel de administración, sin login, sin blog, sin
  calculadora, sin mapa, sin reseñas de Google ni APIs de pago, sin analítica autoalojada, sin
  despliegue en producción ni dominio (todo eso está en «Después del MVP»).
- Sin SSR, server actions ni API routes de Next (el export estático no los admite).
- Las fotos HEIC solo viajan como adjunto; la web muestra únicamente WebP de `web/public/fotos`.
- Las peticiones no se consultan desde la web: se reciben por email; la BD solo es respaldo local.
- No se copian textos, nombres ni fotos de competidores.

## 10. Contratos

### 10.1 `GET /health`
- `{ ok: true, app, commit }`; `commit` es `GIT_SHA` recortado, o «desconocido» si falta o está vacía
  (detalle en §5.1).

### 10.2 Enlaces de contacto (`web/src/lib/whatsapp.ts`)
- Número válido: teléfono español de 9 cifras que empieza por 6-9; se admiten espacios y los prefijos
  `+34` y `0034`.
- `waLink(numero, mensaje)` devuelve `https://wa.me/<solo dígitos>?text=<encodeURIComponent(mensaje)>` y
  **lanza un `Error`** si el número no es válido.
- `telLink(numero)` devuelve `tel:+34XXXXXXXXX` y lanza igual, con el mismo error que `waLink`.
- `esNumeroValido(numero)` devuelve `boolean` con la misma validación que `waLink` y `telLink`. Quien pinte
  un botón de contacto la llama **antes** y no pinta el botón si da `false`:

```ts
const href = esNumeroValido(n) ? waLink(n, mensaje) : null; // null → no se pinta el botón
```
