# Diseño — Duchas 2

Dirección visual del producto. La fija `docs/DESIGN.md` (fuente completa, con tablas módulo a módulo) y la aplica
el bootstrap en `web/src/app/globals.css` (stack `node-hono-next`: tema Astryx neutral + overrides, no
`src/ui/theme.ts`). Toda entrega que toque pantallas la cumple; el revisor de UI la comprueba con capturas.

## Ficha del encargo
- **Tipo:** web de servicios (captar clientes de un oficio) con parte informativa que sirve a la captación.
- **Industria y ámbito:** reparación y esmaltado de sanitarios (platos de ducha primero; bañeras, azulejos) para
  particulares y, después, hoteles y comunidades. Madrid capital y área metropolitana.
- **Avatar y momento:** Marta, desde Google en el móvil, de pie en su baño, con el plato desconchado delante y la
  creencia de que hay que cambiarlo. Secundario: Javier (hotel), en el ordenador.
- **Objetivo medible:** contactos — WhatsApp con foto (principal), llamadas y formularios. Cada página y módulo se
  juzga por si acerca a uno de esos tres toques.
- **Secundarios:** posicionar la cola larga del plato de ducha; desmontar «hay que cambiarlo»; confianza (un
  teléfono, garantía por escrito, fotos reales); una página que Javier pueda reenviar.
- **Palabras clave:** plato de ducha desconchado arreglar · reparar plato de ducha (resina / carga mineral) Madrid ·
  plato de ducha agrietado · esmaltar plato de ducha precio · renovar plato de ducha sin obra · cambiar plato de
  ducha o repararlo · esmaltar bañera Madrid / precio · esmaltado hoteles Madrid.

## Intención
- **Para quién:** Marta en su baño con una mano en el móvil. Manda la respuesta a «¿se arregla?» y el botón para
  mandar la foto. Se esconde (debajo): historia de la empresa, técnica, servicios secundarios.
- **Verbo:** *mandar la foto*. Precio orientativo, comparación, garantía y antes/después existen para que se atreva.
- **Cómo debe sentirse:** como el plato recién esmaltado — porcelana cálida, brillo limpio, oficio a la vista. Ni spa
  de catálogo ni ferretería.

## Competencia (docs/COMPETENCIA.md)
- Nos parecemos: «sin obras ni polvo», teléfono visible y antes/después (lo que hace seria una web del oficio).
- **Diferencia 1:** el plato de ducha es titular, primera imagen y primera tarjeta (nadie lo hace).
- **Diferencia 2:** «¿Reparar o cambiar?» en la portada (nadie compara con cambiarlo: 865-1.200 € / 1.700 €).
- **Diferencia 3:** un solo número, igual en todas partes (Repaban enseña 4).
- **Diferencia 4:** garantía con plazo cuando esté confirmada y «guardamos tu foto N días» junto al botón.
- Adaptamos de Dúchate la barra de contacto móvil y el ritmo de portada.
- Color: la competencia usa azul medio (Repaban #1B7CD4) y verde vivo (Mister Ducha #049B44); nosotros verde azulado
  profundo + porcelana cálida.
- No hacemos: tienda de kits, banners de oferta, contadores sin cifra, blog.

## Páginas y módulos
Notación: obj. = posicionar · confianza · resultados · convertir · informar · orientar. En todas: cabecera fija con
«Llamar» y botón flotante de WhatsApp.

| Página | Ruta | Objetivo |
|---|---|---|
| Portada | `/` | Captar: que Marta mande la foto o llame en < 2 min |
| Platos de ducha | `/platos-de-ducha/` | Posicionar cola larga del plato y convertir (WhatsApp con «plato de ducha») |
| 8 servicios | `/servicios/[slug]/` | Posicionar cada servicio y convertir con mensaje propio |
| Hoteles y comunidades | `/hoteles-y-comunidades/` | Dar a Javier algo que llevar a su dirección + WhatsApp de empresa |
| Tarifas | `/tarifas/` | Responder «cuánto cuesta» sin mandar a un portal |
| Antes y después | `/antes-y-despues/` | Convencer con resultados filtrables |
| Preguntas frecuentes | `/preguntas-frecuentes/` | Posicionar preguntas y quitar dudas |
| Zonas | `/zonas/` | «¿Venís a mi barrio?» |
| Quiénes somos | `/quienes-somos/` | Confianza: forma de trabajar, garantía, años si confirmados |
| Contacto | `/contacto/` | Convertir a quien ya decidió |
| Legales | `/aviso-legal/`, `/privacidad/`, `/cookies/` | LSSI/RGPD; privacidad dice cuánto se guarda la foto |
| 404 | — | «Esta página no existe, pero tu plato sí tiene arreglo» + WhatsApp |

**Portada `/`** — «Tu plato de ducha se repara. Sin obras.» (orden; tipo · peso en pantallas de 360 × 740):
1. Hero (convertir · visual + titular · 1): cinta «MADRID · PLATOS DE DUCHA, BAÑERAS Y AZULEJOS»; H1; subtítulo «Lo
   esmaltamos en tu baño, sin polvo y con garantía por escrito. Mándanos una foto y te decimos si tiene arreglo.»;
   imagen partida por la cinta (SVG «Plato partido» sin fotos); «Tu foto solo la vemos nosotros y se borra a los
   {retencion_dias} días». CTA WhatsApp primario + Llamar, sin scroll.
2. Franja de confianza (confianza · 0,4): 4 compromisos con icono propio; años solo si confirmados.
3. Antes y después (resultados · 1): deslizador del plato + 3 miniaturas + «Ver todos los trabajos». CTA «Manda la foto del tuyo».
4. ¿Reparar o cambiar? (convencer · tabla · 0,8): coste/tiempo/obra; sin cifras, solo tiempo y obra.
5. Cómo trabajamos (convertir · lista · 0,9): 4 pasos, número en cinta, paso 1 = botón WhatsApp.
6. Servicios (orientar · tarjetas · 1,5): tarjeta grande del plato, resto compactas, Hoteles al final.
7. Precios orientativos (informar · cifras · 0,6): «Desde X €» en mono; sin precios, «Presupuesto gratuito…» + WhatsApp.
8. Reseñas (confianza · 0,8): sin reseñas, el bloque no existe.
9. FAQ 4-6 (informar · acordeón · 1) + «Todas las preguntas».
10. Zonas (informar · lista + SVG de anillos · 0,7) + «¿No ves tu zona? Pregúntanos por WhatsApp».
11. Formulario (convertir · 2): pieza (segmentado con icono), foto, teléfono, nombre, zona, daño, mensaje, privacidad.
12. Pie (orientar · 0,8): marca, contacto, horario, servicios, legales, «Guardamos tu foto {N} días».

**Platos de ducha:** migas + hero (WhatsApp «Hola, vengo de la página de platos de ducha. Os mando una foto del
daño») → rejilla de 6 daños → un H2 por daño (80-150 palabras, CTA cada 2) → antideslizante y cambio de color →
materiales (solo confirmados) → galería del plato → ¿Reparar o cambiar? compacto → proceso (curado con
`plazos.uso_ducha` o «Te decimos cuándo puedes usar la ducha») → precio → FAQ ≥ 5 → cierre + relacionados.

**Servicio (plantilla):** migas + hero (H1 servicio + Madrid) → problema → cómo (cinta en números) → precio → antes/después → 2-4 FAQ → relacionados + cierre.

**Hoteles:** H1 «Renovamos bañeras de hotel sin cerrar habitaciones» → cómo trabajamos con hoteles → referencias
(vacío ⇒ no aparece) → garantía → antes/después → «Cuéntanos cuántas bañeras y cuándo».

**Soporte:** Tarifas (tabla trabajo/desde/incluye; WhatsApp en cabecera de tabla y cierre) · Antes y después
(filtro segmentado + rejilla; CTA cada 6 pares) · FAQ (temas como anclas + acordeones) · Zonas (anillos SVG +
distritos + municipios) · Quiénes somos · Contacto (H1 «Mándanos una foto y te decimos si tiene arreglo», 3 vías,
formulario, qué pasa después y retención) · Legales (`--measure`).

## Referencias de diseño (detalle y URL en docs/COMPETENCIA.md)
| Nuestro | Parte de | Qué se adapta |
|---|---|---|
| Ritmo de portada | Dúchate (duchate.es) | beneficios → antes/después → proceso → reseñas → garantías → FAQ → formulario |
| Hero | Miracle Method + NuFinishPro | «reparar gana a cambiar», CTA doble, daño partido por la cinta |
| Cabecera fija + flotante | Bath Fitter + Dúchate | teléfono clicable arriba, WhatsApp fijo abajo |
| Franja de confianza | Bath Fitter + NuFinishPro | 4 compromisos con icono, sin cifras sin confirmar |
| Antes y después | Swiper Studio + Miracle Method | etiqueta servicio/daño, «ANTES/DESPUÉS» en cinta, asa de cinta |
| ¿Reparar o cambiar? | Miracle Method «Why refinishing» | tiempo/coste/obra |
| Pasos | Dúchate + NuFinishPro | 4 pasos, número en cinta |
| Zonas | Revamp Remodel | lista agrupada + esquema, sin mapa |

Paletas de la industria vistas: PaintDB baño 2026 (superficies), Cube Creative fontanería/HVAC (teal), Thumbtack
(tinta carbón), Repaban y Mister Ducha (a evitar). Tendencias aplicadas: rendimiento móvil, titulares grandes,
microcopy, semántica, modo oscuro. Descartadas: glass/neumorfismo, 3D/vídeo, gradientes/bento.

## Mundo del producto
- **Dominio:** esmalte y brillo · cinta de enmascarar · pistola y neblina · lijado y masilla · imprimación · desconchón
  que deja ver el cuerpo oscuro · óxido que crece · desagüe y rejilla · silicona · azulejo 20 × 20 y lechada ·
  curado · certificado de garantía firmado.
- **Colores del mundo:** porcelana cálida #FBFAF6 · lechada #F3F0E7/#E7E2D4 · cinta #F1DA94 · verde agua profundo
  #0A6E64 · óxido #8C5A00 / #B3261E · fondo del desconchón #13201E.
- **Firma — «la línea de cinta»:** tira de cinta crema (`--color-tape`, texto `--color-on-tape`, mono mayúscula),
  plana, siempre con texto, nunca botón. Aparece SOLO en: hero (imagen partida con «ANTES · DESPUÉS»), asa y
  etiquetas de `DeslizadorAntesDespues`, número de `PasosTrabajo` («PASO 1»), cabecera «Reparar» de
  `TablaRepararCambiar`, eyebrow `CintaEtiqueta` del hero.
- **Defaults rechazados:** foto de banco de baño de lujo → el daño de Marta partido por la cinta · azul agua sobre
  blanco frío → teal profundo sobre porcelana cálida · contadores sin cifra y «Pide presupuesto» → franja de
  compromisos verificables y «Manda la foto por WhatsApp» · botón #25D366 con texto blanco (2:1) → botón de marca
  #0A6E64 (6,1:1) con glifo blanco.

## Dirección
1. Porcelana cálida y verde azulado profundo.
2. El daño de Marta es la primera imagen; la cinta lo separa del resultado.
3. Una sola acción, «Manda la foto por WhatsApp», en el único color de marca; «Llamar» al lado, secundario.
4. Titulares en Archivo pesada; texto Figtree 16 px; cifras y etiquetas en mono.
5. Honestidad visible: nada sin confirmar, un teléfono, retención de la foto junto al botón.

## Tokens (web/src/app/globals.css)
Bloque de `docs/DESIGN.md` copiado tal cual tras el import del tema, con `light-dark()` (claro y oscuro en las
mismas variables) en `[data-astryx-theme="neutral"], [data-astryx-theme="neutral"] [data-astryx-media]`.
| Paleta | Variable Astryx | Claro / Oscuro |
|---|---|---|
| surface-0 / 1 / 2 | `--color-background-body` / `-muted` / `-gray` | #FBFAF6 #F3F0E7 #E7E2D4 / #0F1716 #162120 #1E2B29 |
| card | `--color-background-card` | #FFFFFF / #1E2B29 |
| ink-1..4 | `--color-text-primary` / `-secondary` / `--color-icon-secondary` / `--color-text-disabled` | #13201E #36443F #56635F #77827E |
| edge-1..3 | `--color-border` / `-gray` / `-emphasized` | #DDD8CA #C4BEAE #7F8A86 |
| brand | `--color-accent` (+ `--color-info`) | #0A6E64 / #4CC2B1 |
| brand-ink / soft / text | `--color-on-accent` / `--color-accent-muted` / `--color-text-accent` | #FFFFFF #D5ECE7 #08574F |
| brand-2 (cinta) | `--color-tape`, `--color-on-tape` | #F1DA94 / #E3C877; texto #13201E |
| ok / warn / bad | `--color-success` / `--color-warning`+`--color-text-warning` / `--color-error` | #3B7A12 · #F2B33D/#8C5A00 · #B3261E |
| shadow-1 | `--shadow-1` | solo botón flotante y CTA del hero |
| medida | `--measure` | 65ch en texto largo y legales |
Fuentes: `--font-family-heading` «Archivo Variable» (`@fontsource-variable/archivo`, autoalojada), `--font-family-body` «Figtree Variable». Radios: inner 4, element 8, container 12, page 16 px (en rem).
Sombras: solo `--shadow-1` donde se dice. Sin degradados. Contrastes WCAG verificados en `docs/DESIGN.md` § Paleta.

## Tipografía y forma
Archivo 700-800 en títulos (hero con display de Astryx, H2 de sección `Heading` 2); Figtree ≥ 16 px; mono del
sistema solo para cinta, «PASO N», precios y nota de reseñas. Densidad cómoda; botones ≥ 48 px. Radios pequeños y
firmes, nada de píldoras salvo el flotante. Profundidad con bordes y alternancia `surface-0`/`surface-1`; tarjetas
blancas sobre `surface-1`.

## Imágenes y señales de confianza
Fotos del cliente (4:3, ≥ 1600 × 1200, mismo encuadre antes/después; `pnpm fotos` → WebP 1200×900 / 600×450):
1 par del plato desconchado (hero) · 3-6 pares de platos · 2-4 pares por servicio · esmaltador trabajando · cinta
puesta · certificado de garantía · furgoneta · baños de hotel.
Mientras no lleguen: **ilustraciones SVG propias** en `web/src/ui/art.tsx` (trazo `ink-1` 2 px, rellenos
`surface-1`/`card`, daño `warn`/`bad`, cinta `--color-tape`): «Plato partido» (hero), 6 daños, 10 iconos de servicio
(incl. hoteles), 4 de la franja de confianza, reparar vs cambiar, anillos de zonas. Huecos de galería: ilustración
con cinta «ILUSTRACIÓN» y «Pronto, fotos reales de este trabajo». Nada de fotos de banco ni iconos genéricos.
Logotipo: `{{MARCA}}` en Archivo 800 precedido del símbolo (plato `brand` con desagüe `card` y franja de cinta).

| Dato real | Dónde | Mientras no exista |
|---|---|---|
| Teléfono y WhatsApp únicos | cabecera, hero, flotante, pie, contacto | modo borrador; `{{PENDIENTE}}` en local |
| Garantía | franja, paso 4, quiénes somos, hoteles | «Garantía por escrito» sin plazo |
| Años | franja, quiénes somos | no aparece |
| Fotos antes/después | hero, galerías, servicios | ilustraciones rotuladas «Ilustración» |
| Reseñas | portada, plato | bloque oculto, sin AggregateRating |
| Referencias de hoteles | hoteles | bloque oculto |
| Precios «desde» | portada, tarifas, servicios | «Pide presupuesto gratuito» + WhatsApp |
| Plazos | hero, pasos, FAQ | textos alternativos |
| Retención de la foto | bajo CTA del hero, formulario, contacto, privacidad | siempre (90 días por defecto) |

## Patrones de pantalla
- **Cabecera fija:** símbolo + marca; «Llamar» `Button` secundario con icono (número visible desde 768 px); menú en `Drawer` en móvil.
- **Botón flotante WhatsApp** (`BotonFlotanteWhatsApp`): píldora abajo a la derecha, `brand`, ≥ 48 px, `--shadow-1`,
  mensaje por ruta; se oculta mientras el CTA del hero está visible y no tapa el enviar del formulario.
- **Un solo `Button` primario por pantalla, y es WhatsApp.** «Llamar» siempre secundario.
- Visual: imagen a ancho completo en móvil, 55-60 % en escritorio; CTA justo debajo.
- Texto largo: `--measure`, H2 = la pregunta buscada, párrafos de 2-4 líneas, CTA cada 2 apartados.
- Cifras: número grande mono, unidad en `ink-3`; nunca inventada ni «0».
- Tabla: `Table` de Astryx, 3 columnas máx. en móvil, sin scroll horizontal; cabecera «Reparar» en cinta.
- Formulario: `Field` + `TextInput`/`Select`/`Checkbox`/`TextArea`, etiqueta arriba, ayuda debajo, error junto al
  campo; pieza con `SegmentedControl`; foto como botón «Añadir foto del daño»; estados envío/error/confirmación (`Banner` ok).
- Componentes Astryx: `Layout`, `Stack`, `Heading`, `Text`, `Link`, `Button`, `Card`, `Badge`, `Banner`, `Table`,
  `Field`, `TextInput`, `TextArea`, `Select`, `Checkbox`, `SegmentedControl`, `Image`, `EmptyState`, acordeón si D0 lo confirma.
- Composiciones nuevas (registrar en `docs/astryx-componentes.md`): `CintaEtiqueta`, `DeslizadorAntesDespues`,
  `PasosTrabajo`, `TablaRepararCambiar`, `FranjaConfianza`, `TarjetaServicio`, `BotonWhatsApp`,
  `BotonFlotanteWhatsApp`, `CabeceraContacto`, `PrecioDesde`, `BloqueResenas`, `ListaZonas`, `FormularioContacto`
  (+ `CampoFoto`), `GaleriaFiltrable`, `MigasDePan`, `AcordeonFaq`, `IlustracionSvg`, `HuecoFoto`. Las construyen las
  funcionalidades que las usan, tras D0.

## Textos
- Tono: tú, < 15 palabras por frase, verbos de oficio. Nunca «usted», «soluciones integrales» ni promesas sin dato.
- CTA: «Manda la foto por WhatsApp» · «Llamar» · «Manda la foto del tuyo» · «Enviar petición».
- Ayudas: foto «Con una foto del daño te decimos si tiene arreglo. Máximo 10 MB.»; teléfono «Te llamamos o escribimos a este número».
- Vacío de galería: «Aún no hemos subido fotos de este trabajo. Mándanos la tuya y te decimos qué podemos hacer.» + WhatsApp.
- Errores: «Falta tu teléfono.» · «El teléfono tiene que tener 9 cifras.» · «Marca la casilla de privacidad para
  enviar.» · «La foto pesa más de 10 MB; prueba con otra o envíala por WhatsApp» · «Solo se admiten fotos (JPG, PNG,
  WebP o HEIC)» · «Has enviado varias peticiones; llámanos o escríbenos por WhatsApp» · «No hemos podido enviar tu
  petición. No has perdido nada: llámanos o mándanos la foto por WhatsApp.»
- Confirmación: «Recibido. Te respondemos lo antes posible.» (o plazo confirmado) + «¿Quieres adelantar la foto? Mándala por WhatsApp».

## Lista de comprobación visual
1. En 360 × 740 la primera pantalla de la portada muestra cinta, H1 con «plato de ducha», imagen y «WhatsApp» + «Llamar» sin scroll.
2. Un solo botón primario por pantalla, `brand` #0A6E64 con texto blanco, y es de WhatsApp.
3. Botón flotante de WhatsApp en todas las páginas en móvil, con sombra, sin tapar el enviar del formulario.
4. Ningún texto público dice «PENDIENTE», «{{», «0 años» ni muestra contadores sin cifra.
5. La cinta crema solo en hero, deslizador, números de pasos y cabecera «Reparar».
6. Franja de confianza con 4 compromisos e iconos propios justo debajo del hero.
7. «¿Reparar o cambiar?» antes de «Cómo trabajamos», sin scroll horizontal en 320 px.
8. Fondo porcelana cálida alternando #FBFAF6 / #F3F0E7; tarjetas blancas sobre `surface-1`.
9. Titulares en Archivo pesada, texto Figtree ≥ 16 px; precios y «PASO N» en mono.
10. Junto al CTA del hero y en el formulario se lee cuántos días se guarda la foto; el mismo número en `/privacidad/`.
11. Ninguna imagen de banco: foto del cliente o SVG con la paleta (galería rotulada «Ilustración»).
12. Modo oscuro: fondo #0F1716, texto #F3F1EA, botón #4CC2B1 con texto oscuro; la cinta sigue crema con texto oscuro.

## Reglas para las entregas
1. Las vistas componen con Astryx y las composiciones de `web/src/ui/`. Nada de `<style>`, `style=`, `<div>`/`<span>`, colores, tamaños ni fuentes sueltos.
2. Si falta un componente, se compone en `web/src/ui/` con primitivas Astryx y `var(--…)`, y se registra en `docs/astryx-componentes.md`.
3. Texto en español, frases cortas, sin jerga.
4. Móvil primero: sin scroll horizontal entre 320 y 1440 px.
