# Astryx: qué cubre cada pieza (D0)

Puerta D0 del PRD (ADR 0004). Versiones fijadas, exactas, en `web/package.json`:

- `@astryxdesign/core` **0.7.16**
- `@astryxdesign/theme-neutral` **0.7.16**
- `@astryxdesign/cli` **0.7.16**

Cómo se ha comprobado (desde `web/`): `pnpm exec astryx search <pieza>` para encontrar el componente y
`pnpm exec astryx component <Nombre>` para leer sus props. Al subir de versión: `pnpm exec astryx upgrade
--from 0.7.16 --apply` y repetir esta tabla.

## Piezas

Cada fila dice «componente Astryx: X» (se usa tal cual) o «composición con primitivas: NombreLocal
(primitivas usadas)» (componente propio en `web/src/ui/`, solo con primitivas Astryx y `var(--…)`).

| Pieza | Resolución | Notas de la CLI |
|---|---|---|
| botón | componente Astryx: Button (`@astryxdesign/core/Button`) | `variant` primary/secondary/ghost, `size` sm/md/lg, `icon`, `href` (pinta `<a>`). Un solo primary por pantalla. |
| enlace | componente Astryx: Link (`@astryxdesign/core/Link`) | |
| tarjeta | componente Astryx: Card (`@astryxdesign/core/Card`) | `ClickableCard` para tarjetas que enlazan (servicios). |
| titular/texto | componente Astryx: Heading + Text (`@astryxdesign/core/Heading`, `@astryxdesign/core/Text`) | `Text type` body/large/label/supporting/code/display-1..3; `type="code"` da la mono de la cinta y los precios. |
| layout/stack | componente Astryx: Layout + Stack/VStack/HStack (`@astryxdesign/core/Layout`, `/Stack`, `/VStack`, `/HStack`) | También `Grid`, `Section`, `Center`, `AspectRatio`. |
| acordeón | componente Astryx: Collapsible + CollapsibleGroup (`@astryxdesign/core/Collapsible`) | `search accordion` no da un «Accordion»: la CLI indica Collapsible dentro de CollapsibleGroup para el comportamiento de acordeón. `AcordeonFaq` lo envolverá con los datos de `faq.json`. |
| deslizador antes/después | composición con primitivas: DeslizadorAntesDespues (Slider, AspectRatio, Overlay, CintaEtiqueta) | Astryx tiene `Slider` (arrastre táctil y flechas de teclado), pero no un comparador de imágenes. El recorte de la imagen «después» se hará con atributos SVG (`clipPath`/`rect width`), no con `style=`, para respetar el test de estilos. |
| campo de texto | componente Astryx: TextInput dentro de Field (`@astryxdesign/core/TextInput`, `/Field`) | |
| select | componente Astryx: Selector (`@astryxdesign/core/Selector`) | No existe «Select»: `astryx component Select` responde «No component named "Select"» y sugiere Selector. |
| casilla | componente Astryx: CheckboxInput (`@astryxdesign/core/CheckboxInput`) | `CheckboxList` para grupos. |
| adjuntar archivo | componente Astryx: FileInput (`@astryxdesign/core/FileInput`) | Valida tipo, tamaño y número. `CampoFoto` lo envolverá con el botón «Añadir foto del daño». |
| textarea | componente Astryx: TextArea (`@astryxdesign/core/TextArea`) | |
| error de campo | componente Astryx: Field `status` + FieldStatus (`@astryxdesign/core/Field`, `/FieldStatus`) | `status={{type: 'error', message}}` junto al campo; FieldStatus para controles propios. |
| banner | componente Astryx: Banner (`@astryxdesign/core/Banner`) | Cookies y confirmación del formulario. |
| imagen | composición con primitivas: HuecoFoto (AspectRatio + `<img>` nativo, Thumbnail para miniaturas) | No existe «Image»: `astryx component Image` responde «No component named "Image"» y sugiere Lightbox, Thumbnail, Overlay. Se envuelve el `<img>` nativo en AspectRatio (4:3); mientras no haya fotos, ilustración de `web/src/ui/art.tsx`. |
| migas de pan | componente Astryx: Breadcrumbs + BreadcrumbItem (`@astryxdesign/core/Breadcrumbs`) | `MigasDePan` lo alimentará con las rutas y el JSON-LD. |
| segmented control | componente Astryx: SegmentedControl (`@astryxdesign/core/SegmentedControl`) | Pieza del formulario y filtro de la galería. |

Todas las piezas quedan resueltas: no hace falta la pregunta abierta 13 del PRD.

## Composiciones registradas

Componentes propios en `web/src/ui/`, compuestos solo con primitivas Astryx y `var(--…)`. Son los únicos
ficheros exentos de la regla «sin `<div>`/`<span>`» de `web/src/estilos.test.ts` (que lee esta tabla); el resto
de la regla (sin hex, px, rem ni `style=`) les aplica igual.

| Composición | Fichero | Primitivas | Estado |
|---|---|---|---|
| CintaEtiqueta | `web/src/ui/CintaEtiqueta.tsx` | Text (`type="code"`, `as="p"`) + clase `cinta-etiqueta` de globals.css (var(--color-tape), var(--color-on-tape), var(--spacing-*)). Eyebrow del hero de `/` y de la cabecera de `/contacto/` | creada |
| BotonWhatsApp | `web/src/ui/BotonWhatsApp.tsx` | Button (`variante` primary por defecto o secondary, lg) + Icon con glifo propio; href con `waLink()` | creada |
| BotonLlamar | `web/src/ui/BotonLlamar.tsx` | Button (secondary, lg) + Icon con glifo propio; href con `telLink()`. Lo usan la cabecera (`Frame`) y el hero | creada |
| Contenedor `portada` | `web/src/app/page.tsx` (+ `.portada` en globals.css) | VStack (`className="portada"`) que envuelve hero y franja: padding-inline var(--spacing-4), max-inline-size var(--measure), margin-inline auto. Solo clase, sin `<div>`/`<span>` propios; no usa `Section maxWidth` ni `Layout contentWidth` porque pintan estilo en línea | creada |
| FranjaConfianza | `web/src/ui/FranjaConfianza.tsx` | Section (muted) + VStack/HStack (`ul`/`li`) + Text + IconoCompromiso de art.tsx; hueco del icono con la clase `franja-confianza-icono` (var(--spacing-10)) | creada |
| FormularioContacto | `web/src/ui/FormularioContacto.tsx` | Componente puro (sin fetch): VStack `as="form"` + Field + SegmentedControl (icono de art.tsx en `campo-pieza-icono`) + TextInput + Selector + TextArea + CheckboxInput + Link + Banner (`collapsible={false}`, sin `endContent`, que pinta estilo en línea) + Button primario «Enviar petición» (`#enviar-peticion`) + BotonLlamar/BotonWhatsApp secundarios. Honeypot `web` como `<input>` nativo con la clase `campo-trampa`, y `pagina_origen` oculto | creada |
| EnviarContacto | `web/src/ui/EnviarContacto.tsx` | Contenedor cliente sin UI propia: estado, validación con `contactoSchema` y `fetch` multipart a `/api/contacto`; pinta FormularioContacto. Lo usan `/contacto/` y la portada | creada |
| BotonFlotanteWhatsApp | `web/src/ui/BotonFlotanteWhatsApp.tsx` | Button (primary, lg) + Icon con el glifo de BotonWhatsApp; href con `waLink(numero, mensajePorRuta(usePathname()))`. Clase `boton-flotante` (fijo abajo a la derecha, `--radius-full`, `--shadow-1`, `--z-flotante`) y `boton-flotante-oculto` (aria-hidden, sin desmontarse) mientras IntersectionObserver ve `#cta-hero` o `#enviar-peticion`. Montado una vez en `layout.tsx` | creada |
| CampoFoto | `web/src/ui/CampoFoto.tsx` | Field (ayuda y error `detached`) + Button «Añadir foto del daño» / «Quitar foto» + Text sobre `<input type="file">` nativo con la clase `campo-foto-input`. No usa FileInput: descarta en silencio los tipos fuera de `accept` y el aviso tiene que ser el de lib/contacto.ts | creada |
| TarjetaServicio | `web/src/ui/TarjetaServicio.tsx` | ClickableCard (`href` = `servicio.ruta`) solo cuando la ruta tiene página generada (`rutaGenerada` de `web/src/lib/paginas.ts`, que lo deduce de los `page.tsx` de `web/src/app`; prop `enlazar` para forzarlo); si no, Card sin `href` ni `<a>` con el mismo contenido. Padding 6 grande / 4 compacta. + HStack (la grande con `wrap="wrap"`: texto al lado del icono en escritorio, debajo en móvil) + VStack + Heading 3 (`type="display-3"` en la grande) + Text + IconoServicio de art.tsx (`imagen_tarjeta`); ancho del icono con la clase `tarjeta-servicio-icono` (var(--spacing-12), doble con `data-tamano="grande"`) y ancho mínimo del texto grande con `tarjeta-servicio-textos` (5 × var(--spacing-12)). Sin precio | creada |
| PrecioDesde | `web/src/ui/PrecioDesde.tsx` | Text: `type="code"` (mono, `size="xl"`) con la cifra confirmada de `precioDesde()`; Text normal con «Pide presupuesto gratuito». Nunca «0» | creada |
| PasosTrabajo | `web/src/ui/PasosTrabajo.tsx` | VStack (`as="ol"`/`"li"`) + Text (`type="code"`, «PASO N», clase `paso-numero`: var(--color-tape), var(--color-on-tape), var(--spacing-*)) + Heading 3 + Text + BotonWhatsApp secondary en el paso con `accion: 'whatsapp'` (sin número, sin botón). Textos ya resueltos por `resolverPasos()` | creada |
| TablaRepararCambiar | `web/src/ui/TablaRepararCambiar.tsx` | Table en modo children (TableHeader/TableBody/TableRow/TableHeaderCell/TableCell), 3 columnas (concepto, Reparar, Cambiar), texto que envuelve; cabecera «Reparar» con la clase `tabla-cabecera-reparar` (cinta); cifras del coste en Text `type="code"`; fuente en Text supporting solo con la fila de coste. Filas de `filasComparativa()`. Ojo: Table pinta en su contenedor de scroll un `style` propio de overflow (`--x-overflowX:clip…`), que los tests toleran solo en ese elemento | creada |
| ListaZonas | `web/src/ui/ListaZonas.tsx` | VStack + AnillosZonas de art.tsx (ancho con la clase `lista-zonas-anillos`) + dos grupos con Heading 3 y HStack (`as="ul"`, `wrap`) de VStack `as="li"` con Text. Sin Badge ni CTA (lo pone el padre) | creada |
| AcordeonFaq | `web/src/ui/AcordeonFaq.tsx` | Collapsible + CollapsibleGroup (`type="single"`, `hasDividers`) + Text (`as="p"`); todos cerrados al principio, disparador `<button>` nativo con `aria-expanded`. `'use client'` (Collapsible guarda el estado) | creada |
| BloqueResenas | `web/src/ui/BloqueResenas.tsx` | VStack (`section`/`ul`/`li`) + Heading (level 2) + Text (`type="code"` para la nota); nota y número de `resumenResenas()`/`notaVisible()` de seo.ts. Sin reseñas devuelve null | creada |
| HuecoFoto | `web/src/ui/HuecoFoto.tsx` | AspectRatio + `<img>` nativo + art.tsx + CintaEtiqueta; `compacta` (miniaturas): solo la ilustración, sin cintas, aviso ni `hueco`; quien la usa pone una única cinta «ILUSTRACIONES» encima | creada |
| DeslizadorAntesDespues | `web/src/ui/DeslizadorAntesDespues.tsx` | Slider (`isLabelHidden`, «Comparar antes y después», 0-100, inicial 50) + AspectRatio 4:3 + Overlay (`scrim={false}`, cintas) + CintaEtiqueta «ANTES»/«DESPUÉS»; recorte de la «después» con `<clipPath><rect width={posición}>` y asa (`<line>`/`<circle>` con var(--…)). Sin fotos, la ilustración de art.tsx (PlatoPartido) en el mismo lienzo SVG (capa de abajo velada, la de arriba recortada) y el asa siguiendo al Slider; cinta «ILUSTRACIÓN» encima y el aviso + `hueco` una vez debajo. `'use client'` (estado de la posición) | creada |

Notas de implementación:

- Sin compilador StyleX no se puede usar `xstyle`. Las composiciones que necesitan un token que ninguna prop
  expone (el crema de la cinta, el ancho del icono) usan una clase de `web/src/app/globals.css` declarada sin
  capa, que gana a `@layer astryx-base` y solo contiene `var(--…)`.
- `Button size="lg"` toma su alto de `--size-element-lg` (36 px en Astryx). globals.css lo fija en
  `var(--spacing-12)` (48 px) para que «Manda la foto por WhatsApp» y «Llamar» midan ≥ 44 px.
- `Icon` de Astryx es componente cliente: un glifo pasado como función solo funciona desde un fichero
  `'use client'` (por eso BotonWhatsApp y BotonLlamar lo son, y Frame sigue siendo de servidor).
- AspectRatio y Slider pintan `style="--x-aspectRatio…"` / `style="--_slider-…"` (variables internas de
  Astryx, solo números): los tests de HTML las ignoran y siguen prohibiendo cualquier otro `style=`.
- `Grid` con `columns` pinta `style="--x-gridTemplateColumns…"`: para listas se usa VStack/HStack.

Previstas por `brain/design.md` (las construye la funcionalidad que las usa): CabeceraContacto,
GaleriaFiltrable, MigasDePan, IlustracionSvg.
