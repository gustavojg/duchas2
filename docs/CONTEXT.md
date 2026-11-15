# CONTEXT — Duchas 2 (borrador del brain del producto)

## Qué es

Web comercial de `{{MARCA}}`, empresa de Madrid que **repara y esmalta platos de ducha** (servicio
principal), bañeras, azulejos y sanitarios **en casa, sin obras ni polvo**. Su trabajo: que quien cree
que tiene que cambiar el plato (obra, 865-1.200 €) entienda en dos minutos que se repara con garantía
por escrito, y mande una foto por **WhatsApp**, llame o rellene el formulario.

## Para quién

- **Marta** (avatar principal): particular de Madrid, desde el móvil, con el plato dañado delante.
  Quiere saber si se arregla, cuánto cuesta más o menos y mandar una foto sin llamar en horario laboral.
- **Javier** (secundario): mantenimiento de hotel/comunidad; quiere renovar muchas bañeras sin cerrar
  habitaciones, referencias y garantía por escrito.
- **El dueño**: edita contenido en `web/content/*.json` sin tocar componentes; recibe peticiones por email.

## Glosario

| Término | Significado |
|---|---|
| Plato de ducha | servicio principal; siempre primero en el catálogo; página propia `/platos-de-ducha/` |
| Esmaltado | recubrir la pieza con esmalte nuevo; total (bañera completa) o parcial |
| Daños | grieta, golpe, desconchón, perforación, manchas/óxido, pérdida de brillo |
| Antideslizante / cambio de color | tratamientos del plato que tienen apartado propio |
| Precio «desde» | importe mínimo orientativo; solo se publica si está confirmado |
| Dato confirmado | `{ valor, confirmado: true }` en los JSON; lo único que se puede publicar como cifra o plazo |
| Texto alternativo | texto fijo que no promete nada, usado cuando un dato no está confirmado (tabla del PRD) |
| `{{PENDIENTE}}` | marcador visible solo en local/dev para que el cliente vea qué falta |
| `{{MARCA}}` | nombre comercial pendiente |
| Modo borrador | mientras falten datos legales, teléfono o garantía: `noindex` en todo y aviso en el build |
| ¿Reparar o cambiar? | bloque comparativo coste/tiempo/obra: reparación frente a sustitución |
| Cómo trabajamos | 4 pasos: foto por WhatsApp → presupuesto → reparación → garantía |
| Petición | envío del formulario (nombre, teléfono, pieza, daño, foto, zona, mensaje) |
| Honeypot | campo oculto trampa; si viene relleno se responde éxito sin guardar ni enviar |
| Retención | días que se guardan peticiones y fotos (90 por defecto); el mismo valor sale en Privacidad |
| Hoteles y comunidades | página para clientes profesionales con referencias |
| Zonas | Madrid capital y municipios del área metropolitana (solo lista, sin páginas por barrio) |
| D0 | validación previa de Astryx: qué componente cubre cada pieza (`docs/astryx-componentes.md`) |

## Stack

`node-hono-next` (propuesto, ver `docs/decisions/0001-stack.md`): Next.js 16 con export estático +
React 19 + Astryx 0.7.16 (CSS precompilado, tema neutral, Figtree autoalojada) en `web/`; servidor
Hono en `src/` que sirve `web/out`, `/health` y `POST /api/contacto`; SQLite (`node:sqlite`) y fotos en
`DATA_DIR`; email con nodemailer (Mailpit en local). Tests: vitest (`app.request()`, lógica y
`renderToStaticMarkup`), vitest sobre `web/out` y Playwright. Detalles en `docs/ARCHITECTURE.md`.

## Tono

«Tú», frases cortas, honesto. Nada de «usted», ni textos largos que no dicen nada.

## Cosas que NO hacer

- No publicar precios, plazos, años, garantías, materiales reparables ni reseñas sin `confirmado: true`.
- No inventar reseñas ni referencias; sin datos, el bloque no aparece (y no hay AggregateRating).
- No escribir cifras, plazos, teléfonos o textos legales dentro de componentes: todo sale de `web/content`.
- No poner más de un teléfono ni más de un WhatsApp; construir enlaces solo con `telLink`/`waLink`.
- No usar `<div>`/`<span>` sueltos, hex, px, rem ni `style=`; solo componentes y tokens de Astryx.
  No añadir otro design system ni librerías de UI.
- No usar SSR, server actions, API routes ni middleware de Next (export estático).
- No servir las fotos de clientes por HTTP ni guardar IPs en claro.
- No añadir servicios de pago (Google Places, Maps, Formspree, Resend…) ni analítica sin banner.
- No construir lo pospuesto: páginas por barrio, panel de admin, blog, calculadora, mapa, despliegue.
- No copiar textos, nombres ni fotos de Repaban u otros competidores, ni usar sus nombres en metadatos.
- No ocultar los botones «Llamar»/«WhatsApp» bajo el pliegue en móvil 360 px.
