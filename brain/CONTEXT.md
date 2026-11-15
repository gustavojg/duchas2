# CONTEXT — Duchas 2

> Memoria persistente del producto. Todo agente lo lee ANTES de actuar. Corto y verdadero: si algo cambia,
> se cambia aquí primero. Fuentes: `docs/CONTEXT.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/decisions/`.

## Qué es
Web comercial de `{{MARCA}}`, empresa de Madrid que **repara y esmalta platos de ducha** (servicio
principal), bañeras, azulejos y sanitarios **en casa, sin obras ni polvo**. Su trabajo: que quien cree que
tiene que cambiar el plato (obra, 865-1.200 €) entienda en dos minutos que se repara con garantía por
escrito, y mande una foto por **WhatsApp**, llame o rellene el formulario.

Objetivo medible del MVP: contactos (WhatsApp con foto, llamadas y formularios enviados).

## Para quién
- **Marta** (avatar principal, `brain/avatar.md`): particular de Madrid, desde el móvil, con el plato dañado
  delante. Quiere saber si se arregla, cuánto cuesta más o menos y mandar una foto sin llamar en horario laboral.
- **Javier** (secundario): mantenimiento de hotel/comunidad; quiere renovar muchas bañeras sin cerrar
  habitaciones, referencias y garantía por escrito.
- **El dueño**: edita contenido en `web/content/*.json` sin tocar componentes; recibe peticiones por email.

## Estado actual
- Fase: MVP (bootstrap hecho: brain, tema, modelo de datos y portada provisional). Nada de F1-F5 construido.
- Primera tarea obligatoria: **D0** (validar Astryx y escribir `docs/astryx-componentes.md`); bloquea F1, F2, F4 y F5.
- URL producción / staging: ninguna (despliegue fuera del MVP). Local: http://127.0.0.1:3000.

## Alcance del MVP (PRD §3)
- D0 · validación de Astryx (puerta).
- F1 · portada completa · F2 · página de platos de ducha · F3 · 8 servicios + Hoteles y comunidades
- F4 · soporte (FAQ, Tarifas, Antes y después, Quiénes somos, Zonas, Contacto, legales, sitemap, modo borrador, cookies)
- F5 · contacto y conversión (WhatsApp por página, `tel:`, formulario con foto → SQLite + email, límite por IP, borrado automático)

## Stack (resumen; detalle en `brain/architecture.md`)
- Web: Next.js 16 export estático + React 19 + **Astryx 0.7.16** (CSS precompilado, tema neutral con overrides,
  Figtree autoalojada) en `web/`.
- Servidor: Hono en `src/` (un proceso, un puerto): `/health`, `/api/*` (`POST /api/contacto`) y `web/out`.
- Datos: contenido en JSON (`web/content/`, validado con zod); peticiones en SQLite `node:sqlite`
  (`DATA_DIR/app.db`), fotos en `DATA_DIR/fotos/`.
- Correo: nodemailer (`file` por defecto, `smtp` → Mailpit en local).
- Tests: vitest (`app.request()`, lógica pura, `renderToStaticMarkup`), vitest sobre `web/out`, Playwright.

## Regla común: datos confirmados (vinculante)
Todo plazo, precio, cifra o promesa sale de `web/content` como `{ valor, confirmado }` y solo se publica si
`confirmado: true`; si no, el texto alternativo fijo de la tabla del PRD (en local/dev, `{{PENDIENTE}}`).

| Dato | Confirmado | Alternativo |
|---|---|---|
| Plazo de presupuesto | «Presupuesto gratuito en 24 h» | «Presupuesto gratuito y sin compromiso» |
| Duración de la reparación | «Reparado en unas horas» / «en el día» | «Sin obras ni polvo» |
| Respuesta al formulario | «Te respondemos en menos de 24 h» | «Te respondemos lo antes posible» |
| Años de experiencia | «{N} años reparando baños» | no se muestra |
| Garantía | «Garantía por escrito de {N} años» | «Garantía por escrito» (+ `{{PENDIENTE}}` en dev) |
| Precio «desde» | «Desde {X} €» | «Pide presupuesto gratuito» |

## Glosario
| Término | Significado |
|---|---|
| Plato de ducha | servicio principal; siempre primero en el catálogo; página propia `/platos-de-ducha/` |
| Esmaltado | recubrir la pieza con esmalte nuevo; total (bañera completa) o parcial |
| Daños | grieta, golpe, desconchón, perforación, manchas/óxido, pérdida de brillo |
| Antideslizante / cambio de color | tratamientos del plato que tienen apartado propio |
| Precio «desde» | importe mínimo orientativo; solo se publica si está confirmado |
| Dato confirmado | `{ valor, confirmado: true }` en los JSON; lo único que se puede publicar como cifra o plazo |
| Texto alternativo | texto fijo que no promete nada, usado cuando un dato no está confirmado (tabla de arriba) |
| `{{PENDIENTE}}` | marcador visible solo en local/dev para que el cliente vea qué falta |
| `{{MARCA}}` | nombre comercial pendiente; mientras tanto el nombre de trabajo es «Duchas 2» |
| Modo borrador | mientras falten datos legales, teléfono o garantía: `noindex` en todo y aviso en el build |
| ¿Reparar o cambiar? | bloque comparativo coste/tiempo/obra: reparación frente a sustitución |
| Cómo trabajamos | 4 pasos: foto por WhatsApp → presupuesto → reparación → garantía |
| Petición | envío del formulario (nombre, teléfono, pieza, daño, foto, zona, mensaje); tabla `peticiones` |
| Pieza | `plato_ducha`, `banera`, `azulejos`, `otro` |
| Honeypot | campo oculto trampa; si viene relleno se responde 201 sin guardar ni enviar |
| Retención | días que se guardan peticiones y fotos (90 por defecto, `retencion_dias`); el mismo valor sale en Privacidad |
| Envío por IP | intento de formulario registrado con la IP en HMAC (`envios_ip`); 5 por IP cada 60 min |
| Hoteles y comunidades | página para clientes profesionales con referencias |
| Zonas | Madrid capital y municipios del área metropolitana (solo lista, sin páginas por barrio) |
| La cinta | firma visual: cinta de enmascarar crema con texto mono que separa antes/después (`brain/design.md`) |
| D0 | validación previa de Astryx: qué componente cubre cada pieza (`docs/astryx-componentes.md`) |

## Tono
«Tú», frases cortas (menos de 15 palabras), honesto, verbos de oficio. Nada de «usted», ni textos largos que
no dicen nada, ni «soluciones integrales».

## Cosas que NO hacer
- (2026-11-15) No publicar precios, plazos, años, garantías, materiales reparables ni reseñas sin `confirmado: true`.
- (2026-11-15) No inventar reseñas ni referencias; sin datos, el bloque no aparece (y no hay AggregateRating).
- (2026-11-15) No escribir cifras, plazos, teléfonos o textos legales dentro de componentes: todo sale de `web/content`.
- (2026-11-15) No poner más de un teléfono ni más de un WhatsApp; construir enlaces solo con `telLink`/`waLink`.
- (2026-11-15) No usar `<div>`/`<span>` sueltos, hex, px, rem ni `style=`; solo componentes y tokens de Astryx
  (hex solo en `web/src/app/globals.css` y en las ilustraciones SVG con `var(--…)`). Ningún otro design system ni librería de UI.
- (2026-11-15) No usar SSR, server actions, API routes ni middleware de Next (export estático).
- (2026-11-15) No servir las fotos de clientes por HTTP ni guardar IPs en claro.
- (2026-11-15) No añadir servicios de pago (Google Places, Maps, Formspree, Resend…) ni analítica sin banner.
- (2026-11-15) No construir lo pospuesto: páginas por barrio, panel de admin, login, blog, calculadora, mapa, despliegue.
- (2026-11-15) No copiar textos, nombres ni fotos de Repaban u otros competidores, ni usar sus nombres en metadatos.
- (2026-11-15) No ocultar los botones «Llamar»/«WhatsApp» bajo el pliegue en móvil 360 px.
- (2026-11-15) No mostrar en el build público «PENDIENTE», «{{», «0 años» ni contadores sin cifra.
- (2026-11-15) No editar migraciones publicadas de `src/db.ts`: solo se añaden al final.
