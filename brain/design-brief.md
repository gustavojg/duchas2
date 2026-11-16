# Brief de diseño — Duchas 2
Estado: aprobado

Síntesis aprobable de la dirección visual. El detalle módulo a módulo y el bloque de tokens completo están en
`docs/DESIGN.md`; la competencia leída, en `docs/COMPETENCIA.md`. No hay capturas de staging de este producto en
`runs/` ni en `docs/ux-audit/`: el brief parte de los documentos y de las webs abiertas el 2026-11-16.

## Objetivos y público
- **Marta Gil, 47 años, Carabanchel.** Llega desde Google o Google Maps en el móvil (360 px), de pie en su baño,
  con el plato de ducha desconchado delante y la idea de que hay que cambiarlo (obra, polvo, más de 1.000 €).
  Desconfía de chapuzas y de los portales que la llaman cinco veces. **Verbo: mandar la foto del daño por
  WhatsApp.** Antes necesita ver tres cosas: que se repara sin obra, un antes/después creíble y un precio
  orientativo (o, sin precio confirmado, «presupuesto gratuito a partir de una foto»).
- **Javier, mantenimiento de un hotel de 60 habitaciones.** En el ordenador, comparando. Quiere referencias,
  rapidez sin cerrar habitaciones, garantía por escrito y factura. Verbo: pedir presupuesto de empresa.
- **Objetivo medible:** contactos (WhatsApp con foto como principal, llamada, formulario). En 360 × 740 la
  portada enseña titular, imagen y «Manda la foto por WhatsApp» + «Llamar» sin scroll.
- **Qué manda en cada pantalla:** portada → la respuesta «tu plato se repara» y el botón de WhatsApp;
  platos de ducha → reconocer el daño propio en la rejilla de 6 daños; servicio → problema + CTA; hoteles →
  «sin cerrar habitaciones» y garantía; tarifas → la tabla; antes y después → la rejilla filtrada; contacto →
  WhatsApp, luego formulario.

## Competencia y referencias
Abiertas de verdad el 2026-11-16 (las fichas completas de 8 competidores de Madrid están en `docs/COMPETENCIA.md`):
- https://duchate.es/ — estructura: el ritmo de portada (beneficios → antes/después deslizante → 4 pasos →
  opiniones → garantías → FAQ → formulario) y la barra fija inferior «Llamar» en móvil. Es el sustituto (cambiar
  bañera por ducha): le ganamos con el argumento «no hace falta cambiarlo» y sin reciclar fotos entre obras.
- https://www.redesban.es/tarifas/ — tono e información: el único competidor de Madrid que publica precios
  «desde» y acepta hasta 3 fotos en el formulario. Tomamos la tabla de precios clara y la foto como entrada;
  dejamos fuera sus zonas en códigos postales, el «usted» del pie y las erratas.
- https://www.miraclemethod.com/ — jerarquía y tono: «Refinishing beats replacement» como titular y el
  antes/después justo bajo el hero, más la comparación tiempo/ahorro/resultado que se convierte en nuestro
  «¿Reparar o cambiar?». No tomamos sus cifras de franquicia ni sus dos teléfonos.
- https://www.mendabath.co.uk/ — uso de imagen y confianza: especialista europeo en reparación de esmalte que
  separa platos de ducha como servicio propio, enseña foto de su equipo real y un antes/después ajustado al
  mismo encuadre. Tomamos «equipo real + par con el mismo encuadre» y la garantía con plazo junto al servicio.
- https://www.bathfitter.com/us-en/ — estructura de cabecera: teléfono como texto clicable arriba y una fila de
  4 ventajas con icono bajo el hero. Rechazamos sus banners de oferta (uno ya caducado al abrirla) y las fotos
  de estilo de vida.

En qué nos diferenciamos: nadie en Madrid tiene el plato de ducha como protagonista, nadie compara con el coste
de cambiarlo, Repaban enseña 4 teléfonos y ninguno dice qué pasa con la foto que mandas. Nosotros: el plato es el
titular, un único número en el sitio entero y «guardamos tu foto N días» junto al botón.

## Estructura de pantallas y jerarquía
1. **Portada `/`** — manda: hero con cinta «MADRID · PLATOS DE DUCHA, BAÑERAS Y AZULEJOS», H1 «Tu plato de ducha
   se repara. Sin obras.», imagen del plato partida por la cinta y WhatsApp + Llamar. Sigue: franja de 4
   compromisos → antes/después → ¿Reparar o cambiar? → cómo trabajamos (4 pasos) → servicios (plato primero, en
   grande) → precios orientativos → reseñas (solo si existen) → FAQ 4-6 → zonas → formulario → pie. Se esconde:
   historia y técnica.
2. **Platos de ducha** — manda la rejilla de 6 daños tras el hero; siguen los apartados SEO por daño con CTA cada
   dos, materiales confirmados, galería del plato, comparación compacta, proceso, precio, FAQ ≥ 5 y cierre.
3. **Servicio (plantilla de 8)** — problema + CTA arriba; cómo, precio, antes/después, 2-4 FAQ y relacionados.
4. **Hoteles y comunidades** — promesa «sin cerrar habitaciones», cómo trabajamos por plantas, referencias (si no
   hay, no aparece), garantía, antes/después y «Cuéntanos cuántas bañeras y cuándo». Se esconden los precios de
   particular.
5. **Tarifas, Antes y después, FAQ, Zonas, Quiénes somos, Contacto, legales y 404** — una idea por página; la
   tabla, el filtro o el formulario mandan y el texto comercial va debajo.

En todas: cabecera fija con marca y «Llamar», y botón flotante de WhatsApp abajo a la derecha que deja un margen
inferior para no tapar texto ni el «Enviar petición», y se oculta mientras el CTA del hero está a la vista.

## Plantillas UI/UX y adaptación
(URLs de las plantillas de galería en `docs/COMPETENCIA.md` › Referencias de diseño.)
- **Landing de servicio local con barra de contacto fija** (patrón de Dúchate): adaptado a un único botón
  flotante de WhatsApp en vez de dos botones fijos, porque la barra completa tapa texto en 360 px.
- **Hero «reparar gana a cambiar»** (Miracle Method y la página de servicio de NuFinishPro): en lugar de foto de
  baño de catálogo, el daño de Marta partido en vertical por la cinta de enmascarar («ANTES · DESPUÉS»).
- **Módulo antes/después** (plantilla «Before / After – Home Renovation» de Swiper Studio): etiqueta de servicio
  y daño sobre la imagen; el asa del deslizador es una tira de cinta; fondo oscuro de la plantilla → porcelana
  clara. Con teclado (flechas) y con el dedo.
- **Fila de ventajas con icono** (Bath Fitter): 4 compromisos verificables sin cifras sin confirmar (garantía
  por escrito, sin obras ni polvo, un solo teléfono, hoteles y comunidades).
- **Componentes Astryx** (`@astryxdesign/core` 0.7.16, tema `theme-neutral` con overrides): `Layout`, `Stack`,
  `Heading`, `Text`, `Link`, `Button` (un único primario por pantalla, y es WhatsApp), `Card`, `Badge`, `Banner`,
  `Table`, `Field`, `TextInput`, `TextArea`, `Select`, `Checkbox`, `SegmentedControl` (tipo de pieza),
  `Selector` (filtro de galería), `Image`, `EmptyState` (galería vacía y 404), `Drawer` (menú móvil).
  Composiciones propias con esas primitivas y solo tokens: `CintaEtiqueta`, `DeslizadorAntesDespues`,
  `PasosTrabajo`, `TablaRepararCambiar`, `FranjaConfianza`, `TarjetaServicio`, `BotonFlotanteWhatsApp`,
  `FormularioContacto` + `CampoFoto`, `IlustracionSvg`.

## Paleta
Tema claro de porcelana cálida con verde agua profundo; no es la web oscura genérica. Valores fijados sobre las
variables de Astryx (tabla completa y modo oscuro del sistema en `docs/DESIGN.md` › Tokens). Contrastes
calculados con la luminancia relativa de WCAG 2.x (sRGB).

| Token | Hex | Contraste |
| --- | --- | --- |
| surface-0 (`--color-background-body`) | #FBFAF6 | — (porcelana recién esmaltada) |
| surface-1 (`--color-background-muted`) | #F3F0E7 | — (lechada, secciones alternas) |
| card (`--color-background-card`) | #FFFFFF | — (tarjetas sobre surface-1) |
| ink-1 (`--color-text-primary`) | #13201E | 16,0:1 sobre surface-0 · 14,7:1 sobre surface-1 |
| ink-2 (`--color-text-secondary`) | #36443F | 9,8:1 sobre surface-0 · 9,0:1 sobre surface-1 |
| ink-3 (`--color-icon-secondary`, ayudas) | #56635F | 6,0:1 sobre surface-0 · 5,5:1 sobre surface-1 |
| brand (`--color-accent`) | #0A6E64 | 5,9:1 sobre surface-0 · texto blanco encima 6,1:1 |
| brand-text (`--color-text-accent`, enlaces) | #08574F | 8,1:1 sobre surface-0 · 6,8:1 sobre brand-soft |
| brand-soft (`--color-accent-muted`) | #D5ECE7 | ink-1 encima 13,6:1 |
| tape (`--color-tape`, solo la firma) | #F1DA94 | texto #13201E encima 12,1:1 |
| edge-3 (`--color-border-emphasized`, controles) | #7F8A86 | 3,4:1 sobre surface-0 (≥ 3:1 de control) |
| ok (`--color-success`) | #3B7A12 | 5,1:1 sobre surface-0 |
| warn (`--color-text-warning`) | #8C5A00 | 5,6:1 sobre surface-0 |
| bad (`--color-error`) | #B3261E | 6,3:1 sobre surface-0 |

- Rechazado: el verde WhatsApp #25D366 con texto blanco (2,0:1). El botón de WhatsApp es `brand` con el glifo.
- La competencia ocupa el azul medio (Repaban #1B7CD4) y el verde vivo (Mister Ducha #049B44); el verde azulado
  profundo sigue en la familia «agua» que da confianza en el baño sin confundirse con nadie.
- Sin degradados; una sola sombra suave (`--shadow-1`) en el flotante y el CTA del hero.

## Tipografía
- **Titulares: Archivo** (variable, licencia SIL OFL, autoalojada con `@fontsource-variable/archivo`), pesos
  700-800: grotesca robusta que se lee como el rótulo de una furgoneta de oficio.
- **Texto: Figtree** (variable, SIL OFL, `@fontsource-variable/figtree`), 400 y 600; nativa del tema neutral de
  Astryx.
- **Mono del sistema** (`ui-monospace, "SF Mono", Consolas`) solo en la cinta, «PASO N» y los «Desde X €».
- **Escala móvil / escritorio (px, interlineado):** cuerpo 16/16 (1,55) · texto grande 19/19 (1,5) · H3 20/24
  (1,3) · H2 26/34 (1,2) · H1 de hero 34/52 (1,1) · pie y ayudas 14/14 (1,45), nunca para texto informativo
  principal. Medida de lectura 65ch en texto largo y legales. Botones ≥ 48 px de alto.

## Imágenes e iconografía
- **Fotos reales del cliente** (propias, con cesión de uso firmada; 4:3, ≥ 1600 × 1200, luz del baño sin flash,
  mismo encuadre antes y después; `pnpm fotos` las pasa a WebP 1200 × 900 / 600 × 450):
  - Portada y platos de ducha: par cenital de un plato desconchado, con el desagüe visible.
  - Platos de ducha: 3-6 pares por daño (grieta, golpe, óxido, pérdida de brillo, antideslizante, color).
  - Servicios y Antes y después: 2-4 pares por servicio.
  - Cómo trabajamos: la cinta puesta alrededor del plato antes de esmaltar.
  - Quiénes somos y Hoteles: el esmaltador trabajando (sin cara si no quiere), el certificado de garantía sin
    datos personales y 1-3 baños de hotel renovados.
- **Mientras no lleguen:** ilustraciones SVG propias (licencia: del proyecto) con la paleta — «Plato partido» en
  el hero, 6 daños, iconos de servicio, 4 de la franja, reparar frente a cambiar, anillos de zonas. Las que
  ocupan el sitio de un trabajo llevan la cinta «ILUSTRACIÓN» y el pie «Pronto, fotos reales de este trabajo»:
  nunca se presentan como trabajos reales. Galería sin pares: `EmptyState` con WhatsApp. Nada de huecos grises.
- **Prohibido:** fotos de banco (Unsplash incluido) de baños de lujo y fotos de otras empresas.
- **Iconos de interfaz:** los del propio Astryx (teléfono, menú, flecha); iconos de oficio, SVG propios con trazo
  `ink-1` de 2 px. El glifo de WhatsApp se usa según las guías de marca de Meta.
- **Logotipo:** `{{MARCA}}` en Archivo 800 precedido de un plato visto desde arriba en `brand`, con el desagüe en
  blanco y una franja de cinta.

## Tono de los textos y lo que no debe parecer
- **Cómo habla:** de tú, frases de menos de 15 palabras, verbos de oficio («reparamos», «esmaltamos», «te
  decimos»). Honesto: ningún plazo, precio, año ni garantía con plazo que el cliente no haya confirmado; sin
  dato, se usa el texto alternativo del PRD («Presupuesto gratuito y sin compromiso», «Te respondemos lo antes
  posible»).
- **Botones:** «Manda la foto por WhatsApp» · «Llamar» · «Manda la foto del tuyo» · «Enviar petición» ·
  «Ver todos los trabajos».
- **Mensajes:** ayuda de foto «Con una foto del daño te decimos si tiene arreglo. Máximo 10 MB.» · error «El
  teléfono tiene que tener 9 cifras.» · caída «No hemos podido enviar tu petición. No has perdido nada: llámanos o
  mándanos la foto por WhatsApp.» · confirmación «Recibido. Te respondemos lo antes posible.» · privacidad junto
  al botón «Tu foto solo la vemos nosotros y se borra a los 90 días».
- **No debe parecer:** la web oscura genérica de tarjetas iguales y acento neón; una plantilla de agencia con
  «soluciones integrales»; un spa de catálogo con fotos de banco; una ferretería con banners de oferta y
  contadores vacíos; un portal de presupuestos que pide datos antes de enseñar nada. Debe parecer un oficio de
  barrio bien hecho: luz, porcelana limpia, la cinta puesta y el trabajo a la vista.
