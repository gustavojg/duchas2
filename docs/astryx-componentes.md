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
| CintaEtiqueta | `web/src/ui/CintaEtiqueta.tsx` | Text (code) + var(--color-tape) | esta entrega |
| BotonWhatsApp | `web/src/ui/BotonWhatsApp.tsx` | Button primary + Icon | esta entrega |
| FranjaConfianza | `web/src/ui/FranjaConfianza.tsx` | Grid/HStack, Text, IconoCompromiso | esta entrega |

Previstas por `brain/design.md` (las construye la funcionalidad que las usa): DeslizadorAntesDespues,
PasosTrabajo, TablaRepararCambiar, TarjetaServicio, BotonFlotanteWhatsApp, CabeceraContacto, PrecioDesde,
BloqueResenas, ListaZonas, FormularioContacto (+ CampoFoto), GaleriaFiltrable, MigasDePan, AcordeonFaq,
IlustracionSvg, HuecoFoto.
