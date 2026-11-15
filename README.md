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

## Dónde está cada cosa

- `web/src/app/` páginas; `web/src/ui/` marco, composiciones Astryx e ilustraciones SVG (`art.tsx`).
- `web/src/app/globals.css` tokens del tema (porcelana cálida, verde azulado y la cinta), según `docs/DESIGN.md`.
- `src/` servidor Hono; `src/db.ts` tablas (`peticiones`, `envios_ip`).
- `web/content/*.json` (llegará con las funcionalidades): textos, precios, plazos, servicios y fotos editables
  sin tocar componentes. Lo no confirmado por el cliente no se publica.
