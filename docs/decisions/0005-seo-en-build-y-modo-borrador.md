# 0005 — SEO generado en el build y modo borrador con `noindex`

Estado: aceptada · 2026-11-14

## Contexto

El PRD pide `sitemap.xml`, `robots.txt`, Open Graph por página, JSON-LD (LocalBusiness, Service,
FAQPage, BreadcrumbList, AggregateRating si hay reseñas) que coincida con lo visible, y un modo borrador:
mientras falten aviso legal, teléfono o garantía, `noindex` en todo y aviso por consola. Con
`output: 'export'` la ruta dinámica `sitemap.ts` de Next da problemas conocidos.

## Decisión

- `web/src/lib/rutas.ts` es la lista canónica de rutas (estáticas + una por servicio).
- `scripts/seo-build.ts` corre tras `next build`: escribe `sitemap.xml` y `robots.txt` en `web/out` e
  imprime el aviso de borrador con la lista de `datosFaltantes()`.
- `web/src/lib/seo.ts` genera `metadata` (title, description, canonical, Open Graph, `robots`) y los
  JSON-LD **a partir de los mismos datos** que pintan los bloques; el layout raíz pone `noindex` si
  `esBorrador()`.

## Alternativas descartadas

- **`app/sitemap.ts` de Next** con `force-static`: fallos reportados con export estático.
- **`robots.txt` con `Disallow: /` en borrador**: impediría a los buscadores leer el `noindex`; se usa
  solo la meta.
- **Paquete `next-sitemap`**: una dependencia para algo de 30 líneas.

## Consecuencias

- Con el contenido de ejemplo (datos legales sin dar) el sitio sale en borrador, que es lo esperado.
- Los tests de `web/out` comprueban sitemap, `noindex` y unicidad de title/canonical.
