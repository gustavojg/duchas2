# factory

Generado por la software factory con el stack `node-hono-next`: un servidor Hono (Node, TypeScript) sirve la
API y la web Next.js exportada estática con Astryx, en un solo proceso y puerto. Documentos del producto en
`docs/`, memoria del proyecto en `brain/`.

## Arrancar

```bash
corepack enable                 # pnpm 11 (packageManager de package.json)
pnpm install                    # raíz y web/ (pnpm-lock.yaml)
pnpm build                      # exporta la web a web/out + sitemap.xml y robots.txt
pnpm start                      # http://127.0.0.1:3000 (API + web)
```

Para desarrollar con recarga en caliente: `pnpm dev` (http://127.0.0.1:3000; Next reenvía `/api` y `/health`
al servidor Hono en :3001).

Pruebas: `pnpm typecheck && pnpm test`; tras `pnpm build`, `pnpm test:build`. E2E con Chromium:
`pnpm exec playwright install chromium` (una vez) y `pnpm e2e`. Variables de entorno en `.env.example`.
