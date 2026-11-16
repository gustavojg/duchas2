# Duchas 2

Web comercial de una empresa de Madrid que **repara y esmalta platos de ducha** (servicio principal), bañeras,
azulejos y sanitarios en casa, sin obras ni polvo. Su objetivo: que quien cree que tiene que cambiar el plato
entienda en dos minutos que se repara con garantía por escrito, y mande una foto por WhatsApp, llame o rellene
el formulario. «Duchas 2» es el nombre de trabajo hasta que el cliente confirme su marca.

Stack `node-hono-next`: un servidor Hono (Node, TypeScript) sirve la API (`/health`, `/api/contacto`) y la web
Next.js exportada estática con el design system Astryx, en un solo proceso y puerto. Las peticiones del
formulario se guardan en SQLite (`DATA_DIR/app.db`) y las fotos en disco; el correo sale por SMTP (Mailpit en
local) o a ficheros `.eml`. Documentos del producto en `docs/` (PRD, arquitectura, diseño, ADRs), memoria del
proyecto en `brain/`.

## Arrancar

```bash
corepack enable                 # pnpm 11 (packageManager de package.json)
pnpm install                    # raíz y web/ (pnpm-lock.yaml)
pnpm build                      # exporta la web a web/out + sitemap.xml y robots.txt
pnpm start                      # http://127.0.0.1:3000 (API + web)
```

Queda en http://127.0.0.1:3000.

Para desarrollar con recarga en caliente: `pnpm dev` (http://127.0.0.1:3000; Next reenvía `/api` y `/health`
al servidor Hono en :3001).

Pruebas: `pnpm typecheck && pnpm test`; tras `pnpm build`, `pnpm test:build`. E2E con Chromium:
`pnpm exec playwright install chromium` (una vez) y `pnpm e2e`. Variables de entorno en `.env.example`
(por defecto el correo se guarda como `.eml` en `DATA_DIR/mail/`, sin red).

Smoke contra staging: `pnpm e2e:staging` lanza las mismas pruebas e2e contra un servidor ya levantado, sin
arrancar uno propio, y sale con código distinto de 0 ante cualquier fallo. Por defecto apunta a
`http://127.0.0.1:8804`; otra URL con `E2E_BASE_URL=https://… pnpm e2e:staging`. El staging debe estar arriba
con el build actual (`pnpm build && PORT=8804 HOST=127.0.0.1 DATA_DIR=data/staging pnpm start`).
Chromium: `pnpm exec playwright install chromium` (con `--with-deps` si faltan librerías del sistema), uno
de la imagen con `E2E_CHROMIUM_PATH=/ruta/al/chromium`, o el contenedor `mcr.microsoft.com/playwright` con
`--network host`.
El spec `tests/e2e/staging-smoke.spec.ts` recorre todas las rutas de `web/src/lib/rutas.ts` (con los servicios de
`servicios.json`), `/sitemap.xml` y `/robots.txt`, y comprueba que una ruta inexistente da 404. La variable
`E2E_EMAIL_DESTINO=con|sin` (por defecto `con`) declara si el staging arrancó con email de destino: con `con` el
POST `/api/contacto` debe dar 2xx y con `sin` debe dar 503. El staging debe usar `MAIL_TRANSPORT=file` para que no
se envíe ningún email real (como en `pnpm smoke:contacto`). El spec hace 1 POST que cuenta contra el límite por IP
(5 por 60 min).

Smoke del formulario contra un servidor en marcha (el staging): `pnpm smoke:contacto`. Comprueba que
POST `/api/contacto` responde 201 y deja un `.eml` con la foto adjunta, que el honeypot responde 201 sin correo,
que un teléfono de 3 cifras da 400 y que GET no responde 2xx. Variables: `BASE_URL` (por defecto
`http://127.0.0.1:3000`) y `DATA_DIR` (por defecto `./data`). Hace 3 envíos que cuentan contra el límite por IP
(5 por 60 min), así que como mucho una pasada por hora desde la misma IP; si no, da 429 y lo explica. Lee los
`.eml` de `DATA_DIR/mail` en disco: ejecútalo en la máquina del staging o con acceso a su `DATA_DIR/mail`, con
`MAIL_TRANSPORT=file`. El staging necesita `EMAIL_DESTINO` (una dirección local de prueba, ver `.env.example`);
sin ella el primer paso da 503.

## Dónde está cada cosa

- `web/src/app/` páginas; `web/src/ui/` marco, composiciones Astryx e ilustraciones SVG (`art.tsx`).
- `web/src/app/globals.css` tokens del tema (porcelana cálida, verde azulado y la cinta), según `docs/DESIGN.md`.
- `src/` servidor Hono; `src/db.ts` tablas (`peticiones`, `envios_ip`).
- `web/content/*.json` (llegará con las funcionalidades): textos, precios, plazos, servicios y fotos editables
  sin tocar componentes. Lo no confirmado por el cliente no se publica.
