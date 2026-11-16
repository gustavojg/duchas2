# Diseño — Duchas 2

Fecha: 2026-11-14 · Dirección de diseño · Fuentes: `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/research.md`,
`docs/COMPETENCIA.md`. Stack `node-hono-next` con **Astryx 0.7.16**: se aplica el punto 9b (tema Astryx +
overrides), no el bloque `--surface-*`/`--ink-*` de `node-hono-sqlite`. Los nombres `surface/ink/edge/brand`
de este documento son **nombres de paleta**; la sección «Tokens» dice a qué variable de Astryx va cada uno.

## Ficha del encargo

- **Tipo de web:** de servicios (captar clientes de un oficio). Lleva una parte informativa (FAQ, tarifas,
  página larga del plato) que **sirve a la captación**: manda la captación.
- **Industria y ámbito:** reparación y esmaltado de sanitarios (platos de ducha primero; bañeras, azulejos)
  para particulares y, en segundo lugar, hoteles y comunidades. Local: Madrid capital y área metropolitana.
- **Avatar y momento:** Marta, 47 años, llega **desde Google en el móvil, de pie en su baño**, con el plato
  desconchado delante y la creencia de que hay que cambiarlo. Secundario: Javier (hotel), en el ordenador,
  comparando y buscando referencias y garantía.
- **Objetivo medible:** contactos — WhatsApp con foto (principal), llamadas y formularios enviados. Cada
  página y módulo se juzga por si acerca a uno de esos tres toques.
- **Objetivos secundarios:** posicionar por la cola larga del plato de ducha (nadie la ocupa); desmontar «hay
  que cambiarlo» con «¿Reparar o cambiar?»; transmitir confianza con un solo teléfono, garantía por escrito y
  fotos reales; dar a Javier una página que pueda reenviar a su dirección.
- **Palabras clave:** plato de ducha desconchado arreglar · reparar plato de ducha (resina / carga mineral)
  Madrid · plato de ducha agrietado · esmaltar plato de ducha precio · renovar plato de ducha sin obra ·
  cambiar plato de ducha o repararlo · esmaltar bañera Madrid / precio · esmaltado hoteles Madrid.

## Intención

- **Para quién:** Marta en su baño con una mano en el móvil. Lo que manda en cada pantalla es la respuesta
  a «¿se arregla?» y el botón para mandar la foto. Lo que se esconde: historia de la empresa, técnica,
  servicios secundarios — están, pero debajo.
- **Verbo:** *mandar la foto*. Todo lo demás (precio orientativo, comparación, garantía, antes/después)
  existe para que se atreva a mandarla.
- **Cómo debe sentirse:** como el plato recién esmaltado — **porcelana cálida, brillo limpio, oficio a la
  vista**. Ni spa de catálogo ni ferretería: la seguridad de alguien que ha preparado bien la superficie,
  ha puesto la cinta y no deja manchas.

## Competencia

(Resumen de `docs/COMPETENCIA.md`: 6 competidores directos y 2 del sustituto, leídos el 2026-11-14.)
- Todos dicen «sin obras ni polvo» y enseñan teléfono y antes/después: **nos parecemos** ahí, porque es
  lo que hace reconocible una web seria del oficio.
- Nadie tiene el plato de ducha como protagonista; Google no devuelve ninguna empresa para «plato de ducha
  desconchado arreglar». **Diferencia 1:** el plato es el titular, la primera imagen y la primera tarjeta.
- Solo Redesban publica precios; nadie compara con el coste de cambiarlo (Mister Ducha: 1.700 €; Cronoshare
  865-1.200 €). **Diferencia 2:** «¿Reparar o cambiar?» en la portada.
- Repaban enseña 4 teléfonos y Mister Ducha 2. **Diferencia 3:** un solo número, en todas partes igual.
- Solo Dúchate (el sustituto) da garantía con plazo; nadie dice qué pasa con la foto que mandas.
  **Diferencia 4:** garantía con plazo cuando esté confirmada y «guardamos tu foto N días» junto al botón.
- Dúchate tiene la mejor barra de contacto móvil y el mejor ritmo de portada: lo adaptamos.
- Color: la competencia verificada usa azul medio (Repaban #1B7CD4) y verde vivo (Mister Ducha #049B44);
  el sector usa azul «agua». **Nos quedamos en la familia agua pero en verde azulado profundo** y blancos de
  porcelana cálidos: parece del baño, no se confunde con nadie.
- Lo que no hacemos aunque otros lo tengan: tienda de kits, banners de oferta, contadores sin cifra, blog
  (pospuesto por el PRD).

## Páginas y módulos

### Mapa del sitio

| Página | Ruta | Objetivo respecto a la ficha |
|---|---|---|
| Portada | `/` | Captar: que Marta mande la foto o llame en < 2 min |
| Platos de ducha | `/platos-de-ducha/` | Posicionar por la cola larga del plato y convertir esa visita (WhatsApp precargado con «plato de ducha») |
| 8 servicios | `/servicios/[slug]/` | Posicionar cada servicio y convertir con mensaje propio |
| Hoteles y comunidades | `/hoteles-y-comunidades/` | Dar a Javier algo que llevar a su dirección y un WhatsApp de empresa |
| Tarifas | `/tarifas/` | Responder «cuánto cuesta» (búsqueda «esmaltar bañera precio») sin mandar a un portal |
| Antes y después | `/antes-y-despues/` | Convencer con resultados filtrables por servicio |
| Preguntas frecuentes | `/preguntas-frecuentes/` | Posicionar preguntas y quitar dudas antes del contacto |
| Zonas | `/zonas/` | Responder «¿venís a mi barrio?» y posicionar «Madrid + municipio» |
| Quiénes somos | `/quienes-somos/` | Confianza: forma de trabajar, garantía, años si confirmados |
| Contacto | `/contacto/` | Convertir a quien ya decidió: teléfono, WhatsApp, horario, formulario |
| Legales | `/aviso-legal/`, `/privacidad/`, `/cookies/` | Cumplir LSSI/RGPD; privacidad dice cuánto se guarda la foto |
| 404 | — | Recuperar la visita: CTAs y enlaces a plato y servicios |

- **Nos faltaría** respecto a la competencia una «Tarifas» (solo Redesban) y una página de plato propia
  (nadie): las tenemos. **No hacemos** tienda (Redesban), promociones (Mister Ducha) ni blog (pospuesto): no
  sirven al objetivo del MVP.

Notación de las tablas: **Obj.** posicionar · confianza · resultados · convertir · informar · orientar.
**Peso** = pantallas de móvil (360 × 740) que ocupa. **CTA** = qué acción se ve en esa pantalla. En todas las
pantallas hay además cabecera fija con «Llamar» y el botón flotante de WhatsApp (ver patrones).

### Portada `/` — «Tu plato de ducha se repara. Sin obras.»

Orden: lo que lleva al contacto va primero; el texto que posiciona va después, pero existe. Respecto a la
lista de `ARCHITECTURE.md` §5.2 se **adelantan** antes/después y «¿Reparar o cambiar?» (el PRD no fija el
orden de la portada salvo el de los 4 pasos): primero el resultado y la comparación que desmonta la creencia
de Marta, luego el proceso.

| # | Módulo | Obj. | Tipo · peso | Contenido (y qué se ve sin el dato) | CTA |
|---|---|---|---|---|---|
| 1 | Hero | convertir | visual + titular · 1 | Etiqueta de cinta «MADRID · PLATOS DE DUCHA, BAÑERAS Y AZULEJOS»; H1 «Tu plato de ducha se repara. Sin obras.»; subtítulo «Lo esmaltamos en tu baño, sin polvo y con garantía por escrito. Mándanos una foto y te decimos si tiene arreglo.» (plazos solo si confirmados: «Reparado en unas horas»). Imagen: par antes/después real del plato partido por la cinta; sin fotos: ilustración SVG «Plato partido» (ver Imágenes). Línea de privacidad bajo los botones: «Tu foto solo la vemos nosotros y se borra a los {retencion_dias} días». | WhatsApp «Manda la foto por WhatsApp» (primario) + «Llamar» (secundario), ambos sin scroll en 360 px |
| 2 | Franja de confianza | confianza | cifras/lista · 0,4 | 4 compromisos con icono SVG: «Garantía por escrito» (+ «de N años» si confirmado), «Sin obras ni polvo», «Un solo teléfono, siempre el mismo», «Trabajamos para hoteles y comunidades». «N años reparando baños» se añade solo si `anios` confirmado; nunca un contador vacío. | — (CTA del hero aún visible al final de la pantalla 1) |
| 3 | Antes y después | resultados | visual · 1 | Deslizador con un par del plato (servicio principal), etiqueta «Plato de resina · desconchón». Debajo, 3 miniaturas de otros servicios y enlace «Ver todos los trabajos». Sin fotos: ilustración SVG antes/después rotulada «Ilustración» (nunca una foto ajena). | «Manda la foto del tuyo» (WhatsApp, botón bajo el deslizador) |
| 4 | ¿Reparar o cambiar? | convencer/informar | tabla corta · 0,8 | 3 filas (coste, tiempo, obra) × 2 columnas («Reparar» con cabecera de cinta, «Cambiar»). Cifras de `comparativa.json` solo confirmadas; sin cifras, solo tiempo y obra («Sin obras ni polvo» vs «Obra, escombro y alicatado»). Fuente del coste de cambiar en letra pequeña. | «¿Se puede reparar el tuyo? Mándanos la foto» |
| 5 | Cómo trabajamos | convertir | lista numerada · 0,9 | 4 pasos en orden PRD: foto por WhatsApp → presupuesto → reparación → garantía. Número en cinta «PASO 1». Textos según tabla de datos confirmados. | Paso 1 es en sí un botón de WhatsApp |
| 6 | Servicios | orientar/posicionar | tarjetas · 1,5 | Tarjeta 1 grande: «Reparación y esmaltado de platos de ducha» con ilustración y 3 daños que repara. Resto: tarjetas compactas (icono SVG, nombre, una línea de `resumen`, precio «desde» o «Pide presupuesto gratuito»). Hoteles y comunidades al final con su propio tono. | Cada tarjeta enlaza a su página |
| 7 | Precios orientativos | informar | lista de cifras · 0,6 | 3-4 trabajos con «Desde X €» en mono grande y la nota «precio orientativo; el presupuesto final depende del daño». Sin precios confirmados: un solo bloque «Presupuesto gratuito y sin compromiso a partir de una foto». Enlace a Tarifas. | WhatsApp (obligatorio por PRD si no hay precios) |
| 8 | Reseñas | confianza | cita + cifras · 0,8 | Nota media grande (mono), número de opiniones, 3 reseñas con nombre, barrio y fecha; enlace «Escribir una reseña». **Sin reseñas, el bloque no existe** (PRD). | — |
| 9 | Preguntas frecuentes (4-6) | informar/posicionar | acordeón · 1 | Preguntas con `en_portada`: ¿se puede reparar o hay que cambiarlo? ¿cuánto cuesta? ¿cuánto tiempo estoy sin ducha? ¿qué garantía? ¿qué materiales? ¿qué hacéis con mi foto? | Enlace «Todas las preguntas» |
| 10 | Zonas | informar/posicionar | lista + gráfico · 0,7 | «Trabajamos en Madrid capital y estos municipios», distritos y municipios de `zonas.json` en dos grupos con el esquema SVG de anillos. | «¿No ves tu zona? Pregúntanos por WhatsApp» |
| 11 | Formulario | convertir | formulario · 2 | Título «¿Prefieres escribirnos?»; campos del PRD en este orden: pieza (botones segmentados con icono), foto, teléfono, nombre, zona, daño, mensaje, privacidad. Respuesta según tabla («Te respondemos lo antes posible»). | Enviar (botón secundario: el primario sigue siendo WhatsApp) |
| 12 | Pie | orientar | enlaces · 0,8 | Marca, teléfono, WhatsApp, email, horario, servicios, legales, «Guardamos tu foto {N} días». | — |

### Platos de ducha `/platos-de-ducha/` — «Reparación y esmaltado de platos de ducha en Madrid»

Página de posicionamiento que convierte: el primer bloque convierte, los bloques largos posicionan y cada
dos pantallas hay un CTA en línea.

| # | Módulo | Obj. | Tipo · peso | Contenido | CTA |
|---|---|---|---|---|---|
| 1 | Migas + hero | convertir | titular + visual · 1 | Migas «Inicio › Platos de ducha»; H1 «Reparación y esmaltado de platos de ducha en Madrid»; subtítulo «Grietas, golpes, desconchones y óxido: lo reparamos en tu baño, sin cambiar el plato.»; imagen del daño más buscado (desconchón) con la cinta. | WhatsApp con mensaje «Hola, vengo de la página de platos de ducha. Os mando una foto del daño» + Llamar |
| 2 | ¿Qué le pasa a tu plato? | posicionar/orientar | rejilla de 6 daños · 1 | Grieta, golpe, desconchón, perforación, manchas/óxido, pérdida de brillo; cada uno con mini-ilustración SVG y enlace al apartado. Marta reconoce su daño en un vistazo. | — |
| 3 | Apartados por daño | posicionar | texto largo · 3-4 | Un H2 por daño que responde a la búsqueda («¿Se puede arreglar un plato de ducha agrietado?»), 80-150 palabras, mini-ilustración, «qué hacemos» en 3 líneas. Cada 2 apartados, una línea de CTA. | CTA en línea cada 2 apartados |
| 4 | Antideslizante y cambio de color | posicionar/informar | texto + muestras · 0,8 | Dos H2; muestras de color como fichas (solo si el cliente confirma colores; si no, texto sin muestras). | — |
| 5 | Materiales que reparamos | informar | lista · 0,5 | Resina, carga mineral, acrílico, cerámica, piedra… solo los `reparable` confirmados; el resto no aparece. | — |
| 6 | Antes y después del plato | resultados | visual · 1,2 | Galería solo de `servicio: plato-ducha` (deslizador + 3-6 pares). | «Manda la foto del tuyo» |
| 7 | ¿Reparar o cambiar? (resumen) | convencer | tabla · 0,6 | Mismo componente de la portada, versión compacta. | — |
| 8 | Proceso | informar | lista numerada · 0,7 | Los 4 pasos (mismo componente que la portada) con detalle técnico breve: preparar, imprimar, esmaltar, curado («{plazos.uso_ducha}» o «Te decimos cuándo puedes usar la ducha»). | Paso 1 = WhatsApp |
| 9 | Precio orientativo | informar | cifra · 0,4 | «Desde X €» si confirmado; si no, «Pide presupuesto gratuito». | WhatsApp |
| 10 | FAQ del plato (≥ 5) | posicionar | acordeón · 1 | Cuánto dura, cuándo usar la ducha, materiales, antideslizante, golpe/desconchón y óxido. | — |
| 11 | Cierre | convertir | bloque de contacto · 0,6 | «¿Tu plato tiene arreglo? Te lo decimos con una foto.» + WhatsApp + Llamar + enlace a formulario. Relacionados: bañeras, esmaltado parcial, perforadas y óxido. | WhatsApp + Llamar |

### Servicio `/servicios/[slug]/` (plantilla, 8 páginas)

| # | Módulo | Obj. | Tipo · peso | Contenido | CTA |
|---|---|---|---|---|---|
| 1 | Migas + hero | convertir | titular + visual · 1 | H1 con el servicio y «Madrid»; `problema` en una frase; icono/ilustración grande del servicio o foto real. | WhatsApp con `whatsapp_mensaje` + Llamar |
| 2 | Qué problema resuelve | posicionar | texto largo · 1 | `problema` desarrollado, H2 con la búsqueda. | — |
| 3 | Cómo lo hacemos | informar | lista numerada · 0,7 | `como` (pasos) con la cinta en los números. | — |
| 4 | Precio | informar | cifra · 0,3 | «Desde X €» o texto alternativo. | WhatsApp |
| 5 | Antes y después | resultados | visual · 1 | Pares del servicio o ilustración rotulada. | «Manda la foto» |
| 6 | Preguntas (2-4) | posicionar | acordeón · 0,7 | `faqs` del servicio. | — |
| 7 | Relacionados + cierre | orientar/convertir | tarjetas · 0,8 | 2-3 servicios relacionados y bloque de contacto. | WhatsApp + Llamar |

### Hoteles y comunidades `/hoteles-y-comunidades/`

| # | Módulo | Obj. | Tipo · peso | Contenido | CTA |
|---|---|---|---|---|---|
| 1 | Hero | convertir | titular · 1 | H1 «Renovamos bañeras de hotel sin cerrar habitaciones»; subtítulo con la promesa (habitación lista en el día solo si confirmado). | WhatsApp de empresa + Llamar |
| 2 | Cómo trabajamos con hoteles | informar | lista · 1 | Planificación por plantas, horario pactado, sin escombro, certificado por pieza. | — |
| 3 | Referencias | confianza | logos/citas · 0,8 | `referencias.json`; vacío ⇒ el bloque no aparece. | — |
| 4 | Garantía por escrito | confianza | texto + documento · 0,5 | Garantía con plazo/condiciones según tabla; foto del certificado si existe. | — |
| 5 | Antes y después | resultados | visual · 1 | Pares de bañeras. | — |
| 6 | Cierre | convertir | contacto · 0,6 | «Cuéntanos cuántas bañeras y cuándo». | WhatsApp empresa + Llamar + formulario |

### Páginas de soporte

| Página | Módulos en orden (obj. · tipo · contenido) | CTA |
|---|---|---|
| Tarifas | 1 H1 «Precios orientativos de reparación y esmaltado» + nota (informar · texto); 2 tabla trabajo / «desde» / qué incluye (informar · tabla; sin confirmar ⇒ «Pide presupuesto gratuito»); 3 qué sube o baja el precio (posicionar · lista); 4 «¿Reparar o cambiar?» (convencer · tabla); 5 cierre | WhatsApp en la cabecera de la tabla y en el cierre |
| Antes y después | 1 H1; 2 filtro por servicio (orientar · Selector); 3 rejilla de pares (resultados · visual; hueco ⇒ ilustración rotulada; vacío ⇒ `EmptyState` de Astryx con título «Aún no hemos subido fotos de este trabajo.», descripción «Mándanos la tuya y te decimos qué podemos hacer.» y WhatsApp); 4 cierre | «Manda la foto del tuyo» |
| Preguntas frecuentes | 1 H1; 2 temas como anclas; 3 acordeones por tema (posicionar); 4 «¿No está tu pregunta?» | WhatsApp |
| Zonas | 1 H1 «Zonas donde trabajamos en Madrid»; 2 esquema de anillos SVG; 3 distritos; 4 municipios; 5 cierre | «¿No ves tu zona? Pregúntanos» |
| Quiénes somos | 1 H1; 2 forma de trabajar (confianza · texto + foto del equipo o ilustración de herramientas); 3 garantía (confianza); 4 años (solo si confirmados); 5 cierre | WhatsApp + Llamar |
| Contacto | 1 H1 «Mándanos una foto y te decimos si tiene arreglo»; 2 tres vías en tarjetas (WhatsApp grande, teléfono + horario, email); 3 formulario; 4 qué pasa después (3 pasos) y retención | WhatsApp primario |
| Legales | H1 + texto largo con medida de lectura; privacidad con `{retencion_dias}` | — |
| 404 | «Esta página no existe, pero tu plato sí tiene arreglo» + WhatsApp + enlaces a plato, servicios, contacto | WhatsApp |

**Preguntas que respondemos y la competencia no:** ¿se repara el plato (no la bañera)? · ¿cuánto cuesta frente a
cambiarlo? · ¿cuánto tiempo sin ducha? · ¿qué pasa con mi foto? · ¿cuál es el número bueno? · ¿qué garantía,
cuánto dura y qué cubre? **Señales de confianza desde el primer día** (sin datos del cliente): garantía por
escrito, un solo teléfono, retención de la foto con su plazo, «sin obras ni polvo», páginas legales completas.

## Referencias de diseño

(Detalle y URL en `docs/COMPETENCIA.md` › «Referencias de diseño».)

| Página / módulo nuestro | Parte de | Qué se adapta |
|---|---|---|
| Portada: ritmo general | R3 Dúchate (https://duchate.es/) | Beneficios → antes/después → proceso → reseñas → garantías → FAQ → formulario; añadimos «¿Reparar o cambiar?» y precios |
| Hero (portada y plato) | R2 Miracle Method (https://www.miraclemethod.com/) + R1 NuFinishPro (https://nufinishpro.com/services/bathtub-refinishing/) | «Reparar gana a cambiar» como titular; CTA doble; nuestra imagen es el daño de Marta partido por la cinta |
| Cabecera fija + botón flotante | R4 Bath Fitter (https://www.bathfitter.com/us-en/) + R3 Dúchate | Teléfono como texto clicable en cabecera; acción fija abajo, que en nuestro caso es WhatsApp |
| Franja de confianza | R4 Bath Fitter (4 iconos) + R1 (logos + garantía) | 4 compromisos con icono propio, sin cifras no confirmadas |
| Antes y después | R5 Swiper Studio (https://studio.swiperjs.com/templates/before-after-home-renovation) + R2 | Etiqueta de servicio y daño, «ANTES/DESPUÉS» en cinta, deslizador con asa de cinta |
| ¿Reparar o cambiar? | R2 «Why refinishing» | Tres filas tiempo/coste/obra |
| Cómo trabajamos / Proceso | R3 (4 pasos) + R1 (proceso detallado) | 4 pasos del PRD, número en cinta, paso 1 = botón |
| FAQ | R1 (FAQ con precio y curado) + R3 (8 preguntas) | Acordeón con preguntas del avatar |
| Zonas | R6 Revamp Remodel (ficha) | Lista agrupada + esquema; sin mapa interactivo (pospuesto) |
| Página del plato | R1 NuFinishPro | Página larga de servicio con proceso, precio y FAQ |
| Hoteles | R4 (bloque de consulta) | Cierre con contacto empresa |

Paletas vistas: PaintDB baño 2026 (superficies), Cube Creative fontanería/HVAC (convención agua y teal),
Thumbtack (tinta carbón), logos de Repaban y Mister Ducha (a evitar). Tendencias aplicadas: rendimiento móvil,
titulares grandes, microcopy en formularios, estructura semántica, modo oscuro del sistema. Descartadas:
glass/neumorfismo, 3D/vídeo, gradientes/bento.

## Mundo del producto

**Dominio:** esmalte y su brillo · cinta de enmascarar (la cinta de papel crema con la que el esmaltador
protege juntas y grifería antes de pistolear) · pistola de esmalte y neblina · lijado y masilla · imprimación
anticorrosión · desconchón que deja ver el cuerpo oscuro del plato · mancha de óxido que crece desde el golpe ·
desagüe y rejilla · junta de silicona · azulejo de 20 × 20 y su lechada · curado («no uses la ducha hasta…») ·
certificado de garantía firmado.

**Mundo de color:**
- Porcelana / esmalte nuevo — blanco cálido, nunca azulado (#FBFAF6, #FFFFFF en piezas recién esmaltadas).
- Lechada y azulejo claro — crema grisáceo (#F3F0E7, #E7E2D4).
- Cinta de enmascarar — crema amarillento (#F1DA94).
- Verde azulado del agua estancada en el plato y de los azulejos «verde agua» de los baños de los 80 — llevado
  a profundo (#0A6E64).
- Óxido de la mancha — ámbar tostado (#8C5A00) y rojo hierro (#B3261E).
- Fondo del desconchón (hierro, cerámica cruda) — verde negro (#13201E).

**Firma — «la línea de cinta»:** una tira de cinta de enmascarar crema con texto en mono mayúscula, que en
el oficio separa lo que se va a esmaltar de lo que no; en la web separa **antes** de **después** y marca lo que
importa. Aparece en:
1. **Hero:** la imagen (foto o SVG) del plato partida en vertical por la cinta, con «ANTES» y «DESPUÉS» rotulados en ella.
2. **Deslizador antes/después** (`DeslizadorAntesDespues`): el asa es una tira vertical de cinta; las etiquetas, cinta.
3. **Cómo trabajamos / Proceso** (`PasosTrabajo`): el número de cada paso va en un trozo de cinta («PASO 1»).
4. **¿Reparar o cambiar?** (`TablaRepararCambiar`): la cabecera de la columna «Reparar» es cinta.
5. **Eyebrow del hero** (`CintaEtiqueta`): «MADRID · PLATOS DE DUCHA, BAÑERAS Y AZULEJOS».
La cinta es plana (sin rotación ni textura) para que salga con tokens y composición Astryx; su único color es
`--color-tape` y su texto `--color-on-tape`. Nunca se usa como botón ni como decoración sin texto.

**Defaults rechazados:**
1. *Foto de banco de un baño de lujo con el titular encima* → **el daño de Marta partido por la cinta** (foto
   real o ilustración propia): enseña el problema que tiene y el resultado a la vez, y ocupa el mismo sitio.
2. *Azul «agua» de fontanería sobre blanco frío* → **verde azulado profundo sobre porcelana cálida** con la
   cinta crema: sigue diciendo «agua y limpieza», pero no se confunde con Repaban ni con el fontanero genérico.
3. *Contadores «Años / Clientes / Trabajos» y «Pide presupuesto» como acción* (Redesban y Duchaybañera los
   enseñan sin cifra) → **franja de compromisos verificables** (garantía por escrito, un teléfono, la foto se
   borra a los N días, sin obras) y **«Manda la foto por WhatsApp»** como acción única: igual de visibles,
   y no dependen de datos que aún no hay.
4. *Botón verde WhatsApp #25D366 con texto blanco* (contraste 1,98:1) → botón de marca (#0A6E64, 6,1:1)
   con el glifo de WhatsApp en blanco: se reconoce por el icono y se lee al sol.

## Dirección

1. Porcelana cálida y verde azulado profundo: parece un baño limpio y un oficio serio, no una franquicia ni un spa.
2. El daño de Marta es la primera imagen; la cinta de enmascarar lo separa del resultado y se vuelve la firma.
3. Una sola acción en todo el sitio, «Manda la foto por WhatsApp», en el único color de marca; «Llamar» siempre al lado, en secundario.
4. Titulares en Archivo pesada, como el rótulo de una furgoneta; texto en Figtree a 16 px; cifras y etiquetas en mono.
5. Honestidad visible: nada de cifras sin confirmar ni huecos, un teléfono y la retención de la foto escrita junto al botón.

## Paleta

Contrastes WCAG 2.x calculados a mano con la fórmula de luminancia relativa (sRGB); valores redondeados.

| Token (paleta) | Claro | Oscuro | De dónde sale | Competencia |
|---|---|---|---|---|
| `surface-0` | #FBFAF6 | #0F1716 | Porcelana recién esmaltada; PaintDB «Chantilly Lace» #F4F6F1 calentado | Nadie verificado usa blanco cálido (Repaban fondo #F1F0F3, frío) |
| `surface-1` | #F3F0E7 | #162120 | Lechada clara / «Pure White» #EDECE6 | — |
| `surface-2` | #E7E2D4 | #1E2B29 | Azulejo crema de los 80 | — |
| `card` | #FFFFFF | #1E2B29 | Pieza recién esmaltada, sobre secciones `surface-1` | — |
| `ink-1` | #13201E | #F3F1EA | Fondo verde-negro del desconchón; Thumbtack #2F3033 como referencia de tinta | — |
| `ink-2` | #36443F | #CDD3CF | Junta envejecida | — |
| `ink-3` | #56635F | #A5AEAA | Lechada sucia (pies de foto, ayudas) | — |
| `ink-4` | #77827E | #808A86 | Solo deshabilitado y placeholders | — |
| `edge-1` | #DDD8CA | #26332F | Línea de lechada (separadores, bordes de tarjeta) | — |
| `edge-2` | #C4BEAE | #34433F | Borde marcado (tabla, divisores fuertes) | — |
| `edge-3` | #7F8A86 | #7A8783 | Bordes de controles (input, select, casilla) | — |
| `brand` | #0A6E64 | #4CC2B1 | Verde agua de los azulejos de los 80 llevado a profundo; teal HVAC #469EA6 de Cube Creative como origen | Repaban azul #1B7CD4, Mister Ducha verde #049B44: ninguno teal profundo |
| `brand-ink` | #FFFFFF | #062421 | Texto sobre `brand` | — |
| `brand-soft` | #D5ECE7 | #173A35 | Fondo de avisos informativos y estado seleccionado | — |
| `brand-text` | #08574F | #7FD6C9 | Enlaces y texto de acento | — |
| `brand-2` (`tape`) | #F1DA94 | #E3C877 | Cinta de enmascarar. **Único uso: la firma** | Nadie |
| `on-tape` | #13201E | #13201E | Texto sobre la cinta (en ambos modos) | — |
| `ok` | #3B7A12 | #8BC86A | Verde hoja (distinto del teal de marca: tono ~95° frente a ~174°) | — |
| `warn` | #8C5A00 (texto) · relleno #F2B33D | #E7B54A | Óxido ámbar | — |
| `bad` | #B3261E | #FF8A7A | Rojo hierro del óxido | — |
| `shadow-1` | `0 6px 16px #0A6E6433` | `0 6px 16px #00000066` | Solo botón flotante de WhatsApp y CTA primario del hero | — |

**Contrastes calculados**

| Par | Claro | Oscuro | Mínimo | ✓ |
|---|---|---|---|---|
| `ink-1` / `surface-0` | 16,0 | 16,1 | 7 | ✓ |
| `ink-1` / `surface-1` | 14,7 | 14,6 | 7 | ✓ |
| `ink-1` / `surface-2` | 13,0 | 12,9 | 7 | ✓ |
| `ink-2` / `surface-0` · `surface-1` · `surface-2` | 9,8 · 9,0 · 7,9 | 12,0 · — · 9,6 | 4,5 (secundario) | ✓ |
| `ink-3` / `surface-0` · `surface-1` · `surface-2` | 6,0 · 5,5 · 4,9 | 8,0 · — · 6,4 | 4,5 | ✓ |
| `ink-4` / `surface-0` | 3,8 | 5,1 | 3 (solo deshabilitado/placeholder, no texto informativo) | ✓ |
| `brand-ink` / `brand` | 6,1 | 7,5 | 4,5 | ✓ |
| `brand` / `surface-0` (botón como forma, enlace) | 5,9 | 8,4 | 3 (forma) / 4,5 (texto) | ✓ |
| `brand-text` / `surface-0` | 8,1 | 10,7 | 4,5 | ✓ |
| `brand-text` / `brand-soft` | 6,8 | 7,3 | 4,5 | ✓ |
| `ink-1` / `brand-soft` | 13,6 | 11,0 | 7 | ✓ |
| `on-tape` / `tape` | 12,1 | 10,3 | 4,5 | ✓ |
| `edge-3` (controles) / `surface-0` · `surface-1` | 3,4 · 3,1 | 4,9 · 4,4 | 3 | ✓ |
| `ok` / `surface-0`; blanco / `ok` | 5,1; 5,3 | 8,4 | 4,5 | ✓ |
| `warn` / `surface-0` | 5,6 | 9,6 | 4,5 | ✓ |
| `bad` / `surface-0`; blanco / `bad` | 6,3; 6,5 | 7,9 | 4,5 | ✓ |
| Referencia rechazada: blanco / #25D366 (WhatsApp) | 2,0 | — | 4,5 | ✗ (por eso no se usa) |

`edge-1` y `edge-2` son separadores decorativos (no delimitan controles): no se les exige 3:1.

## Tipografía y forma

- **Títulos: Archivo** (variable, OFL) autoalojada con `@fontsource-variable/archivo`, peso 700-800. Grotesca
  robusta de rotulación: se lee como el vinilo de una furgoneta de oficio y aguanta 360 px sin partirse mal.
  Coste cero, sin servicios de terceros. Solo se sirve el subconjunto latino (`latin` + `latin-ext` por la ñ).
- **Texto: Figtree** autoalojada (`@fontsource-variable/figtree`), ya decidida en ARCHITECTURE/ADR 0004 y
  nativa del tema neutral. 16 px mínimo en móvil y escritorio.
- **Mono:** pila del sistema de Astryx (`ui-monospace, "SF Mono", Monaco, Consolas…`), coste cero. Solo para
  lo rotulado: texto de la cinta, «PASO 1», precios «desde», nota media de reseñas.
- **Escala:** la del tema, salvo `--font-size-base` y `--font-size-lg` en escritorio, que se suben a los
  valores táctiles (1rem / 1,1875rem): Marta y Javier leen mejor a 16 px. Hero H1 con el estilo display de
  Astryx (`--text-display-1-*`); H2 de sección con `Heading` nivel 2.
- **Densidad:** cómoda. Botones de acción en tamaño grande (≥ 48 px de alto; mínimo PRD 44 × 44). Secciones
  con aire suficiente para que cada una se lea como «una pantalla, una idea».
- **Radios:** pequeños y firmes, como el canto romo de un plato y el bisel del azulejo: `inner` 4 px,
  `element` 8 px, `container` 12 px, `page` 16 px. Nada de píldoras salvo el botón flotante.
- **Profundidad:** bordes (`edge-1`) y alternancia `surface-0`/`surface-1` entre secciones; tarjetas blancas
  sobre `surface-1`. **Sombra `shadow-1` solo** en el botón flotante de WhatsApp y en el CTA primario del hero.
  Sin degradados.
- **Medida de lectura:** `--measure: 65ch` para módulos de texto largo y legales.

## Tokens

**Tema base: `@astryxdesign/theme-neutral` 0.7.16.** Por qué: es el único tema probado en la fábrica con
Next 16 y la ruta «Plain CSS» (ADR 0004), es neutro (acento #1B1B1B) y por tanto no arrastra un color que
haya que pelear; trae `light-dark()` para el modo oscuro y Figtree como fuente de texto, que ya era la
elegida. Variables leídas del fichero publicado
(https://unpkg.com/@astryxdesign/theme-neutral@0.7.16/theme.css).

**Dónde van los overrides** (STACK.md de la fábrica): en `web/src/app/globals.css`, **después** del import del
tema, fuera de capas, con selector `[data-astryx-theme="neutral"]`. El tema redefine `--color-text-primary`,
`--color-icon-primary` y `--color-accent` en elementos con `[data-astryx-media]`; como una declaración en el
propio elemento gana a la heredada, el selector del bloque debe ser
`[data-astryx-theme="neutral"], [data-astryx-theme="neutral"] [data-astryx-media]`.
`--spacing-*` no lo declara el tema (viene del core) y no se toca.

| Variable del tema | Claro | Oscuro | Token de paleta |
|---|---|---|---|
| `--color-background-body` | #FBFAF6 | #0F1716 | surface-0 |
| `--color-background-surface` | #FBFAF6 | #162120 | surface-0 / surface-1 |
| `--color-background-muted` | #F3F0E7 | #162120 | surface-1 (secciones alternas) |
| `--color-background-card` | #FFFFFF | #1E2B29 | card |
| `--color-background-popover` | #FFFFFF | #1E2B29 | card |
| `--color-skeleton` | #E7E2D4 | #1E2B29 | surface-2 |
| `--color-background-gray` | #E7E2D4 | #1E2B29 | surface-2 |
| `--color-text-primary` | #13201E | #F3F1EA | ink-1 |
| `--color-text-secondary` | #36443F | #CDD3CF | ink-2 |
| `--color-text-disabled` | #77827E | #808A86 | ink-4 |
| `--color-text-accent` | #08574F | #7FD6C9 | brand-text |
| `--color-icon-primary` | #13201E | #F3F1EA | ink-1 |
| `--color-icon-secondary` | #56635F | #A5AEAA | ink-3 |
| `--color-icon-disabled` | #77827E | #808A86 | ink-4 |
| `--color-border` | #DDD8CA | #26332F | edge-1 |
| `--color-border-emphasized` | #7F8A86 | #7A8783 | edge-3 (controles) |
| `--color-border-gray` | #C4BEAE | #34433F | edge-2 |
| `--color-accent` | #0A6E64 | #4CC2B1 | brand |
| `--color-accent-muted` | #D5ECE7 | #173A35 | brand-soft |
| `--color-on-accent` | #FFFFFF | #062421 | brand-ink |
| `--color-icon-accent` | #0A6E64 | #4CC2B1 | brand |
| `--color-info` | #0A6E64 | #4CC2B1 | brand (sin azul ajeno) |
| `--color-info-muted` | #D5ECE7 | #173A35 | brand-soft |
| `--color-on-info` | #FFFFFF | #062421 | brand-ink |
| `--color-on-info-muted` / `--color-text-info` | #08574F | #7FD6C9 | brand-text |
| `--color-success` / `--color-text-success` | #3B7A12 | #8BC86A | ok |
| `--color-success-muted` | #DCEBCF | #8BC86A3D | ok-soft |
| `--color-warning` | #F2B33D | #E7B54A | warn (relleno) |
| `--color-text-warning` / `--color-on-warning-muted` | #8C5A00 | #E7B54A | warn |
| `--color-warning-muted` | #F7E3B5 | #E7B54A3D | warn-soft |
| `--color-error` / `--color-text-error` | #B3261E | #FF8A7A | bad |
| `--color-error-muted` | #F6D3CF | #FF8A7A3D | bad-soft |
| `--shadow-inset-hover` | `inset 0 0 0 2px #0A6E644D` | `inset 0 0 0 2px #4CC2B14D` | focus (anillo hover) |
| `--shadow-inset-selected` | `inset 0 0 0 2px #0A6E64` | `inset 0 0 0 2px #4CC2B1` | focus (anillo seleccionado, opaco para ≥ 3:1) |
| `--font-family-heading` | `"Archivo Variable", Figtree, -apple-system, "Segoe UI", Roboto, Arial, sans-serif` | = | display |
| `--font-family-body` | `"Figtree Variable", Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif` | = | text |
| `--font-family-code` | (sin cambio) pila mono del sistema | = | mono |
| `--font-size-base` | 1rem | = | texto 16 px |
| `--font-size-lg` | 1.1875rem | = | texto grande |
| `--radius-inner` | 0.25rem | = | radius-sm |
| `--radius-element` | 0.5rem | = | radius-md |
| `--radius-container` | 0.75rem | = | radius-lg |
| `--radius-page` | 1rem | = | — |

Variables propias del producto (solo las leen los componentes de composición de `web/src/ui/` listados en
`docs/astryx-componentes.md`):

| Variable | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-tape` | #F1DA94 | #E3C877 | brand-2: cinta (firma) |
| `--color-on-tape` | #13201E | #13201E | texto de la cinta |
| `--shadow-1` | `0 6px 16px #0A6E6433` | `0 6px 16px #00000066` | botón flotante y CTA del hero |
| `--measure` | 65ch | = | módulos de texto largo |

Bloque para `globals.css` (el adaptador lo copia tal cual tras el import del tema):

```css
[data-astryx-theme="neutral"],
[data-astryx-theme="neutral"] [data-astryx-media] {
  --color-background-body: light-dark(#FBFAF6, #0F1716);
  --color-background-surface: light-dark(#FBFAF6, #162120);
  --color-background-muted: light-dark(#F3F0E7, #162120);
  --color-background-card: light-dark(#FFFFFF, #1E2B29);
  --color-background-popover: light-dark(#FFFFFF, #1E2B29);
  --color-skeleton: light-dark(#E7E2D4, #1E2B29);
  --color-background-gray: light-dark(#E7E2D4, #1E2B29);
  --color-text-primary: light-dark(#13201E, #F3F1EA);
  --color-text-secondary: light-dark(#36443F, #CDD3CF);
  --color-text-disabled: light-dark(#77827E, #808A86);
  --color-text-accent: light-dark(#08574F, #7FD6C9);
  --color-icon-primary: light-dark(#13201E, #F3F1EA);
  --color-icon-secondary: light-dark(#56635F, #A5AEAA);
  --color-icon-disabled: light-dark(#77827E, #808A86);
  --color-border: light-dark(#DDD8CA, #26332F);
  --color-border-emphasized: light-dark(#7F8A86, #7A8783);
  --color-border-gray: light-dark(#C4BEAE, #34433F);
  --color-accent: light-dark(#0A6E64, #4CC2B1);
  --color-accent-muted: light-dark(#D5ECE7, #173A35);
  --color-on-accent: light-dark(#FFFFFF, #062421);
  --color-icon-accent: light-dark(#0A6E64, #4CC2B1);
  --color-info: light-dark(#0A6E64, #4CC2B1);
  --color-info-muted: light-dark(#D5ECE7, #173A35);
  --color-on-info: light-dark(#FFFFFF, #062421);
  --color-on-info-muted: light-dark(#08574F, #7FD6C9);
  --color-text-info: light-dark(#08574F, #7FD6C9);
  --color-success: light-dark(#3B7A12, #8BC86A);
  --color-text-success: light-dark(#3B7A12, #8BC86A);
  --color-success-muted: light-dark(#DCEBCF, #8BC86A3D);
  --color-warning: light-dark(#F2B33D, #E7B54A);
  --color-text-warning: light-dark(#8C5A00, #E7B54A);
  --color-on-warning-muted: light-dark(#8C5A00, #E7B54A);
  --color-warning-muted: light-dark(#F7E3B5, #E7B54A3D);
  --color-error: light-dark(#B3261E, #FF8A7A);
  --color-text-error: light-dark(#B3261E, #FF8A7A);
  --color-error-muted: light-dark(#F6D3CF, #FF8A7A3D);
  --shadow-inset-hover: inset 0 0 0 2px light-dark(#0A6E644D, #4CC2B14D);
  --shadow-inset-selected: inset 0 0 0 2px light-dark(#0A6E64, #4CC2B1);
  --font-family-heading: "Archivo Variable", Figtree, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-body: "Figtree Variable", Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-size-base: 1rem;
  --font-size-lg: 1.1875rem;
  --radius-inner: 0.25rem;
  --radius-element: 0.5rem;
  --radius-container: 0.75rem;
  --radius-page: 1rem;
  /* propias del producto */
  --color-tape: light-dark(#F1DA94, #E3C877);
  --color-on-tape: #13201E;
  --shadow-1: 0 6px 16px light-dark(#0A6E6433, #00000066);
  --measure: 65ch;
}
```

Las fuentes se importan en `globals.css` antes del bloque: `@import "@fontsource-variable/archivo";` y
`@import "@fontsource-variable/figtree";` (dependencias npm OFL, servidas desde `web/out`, sin red externa).
Nota para la guarda de D0: este bloque vive en `globals.css`, que es el único sitio autorizado para hex.

## Imágenes

Fotos reales del cliente (pedir en este orden; horizontales 4:3, mínimo 1600 × 1200, luz natural o del baño
sin flash, encuadre igual en el antes y el después; el pipeline `pnpm fotos` las lleva a WebP 1200 × 900 / 600 × 450):

| # | Foto | Encuadre | Dónde va |
|---|---|---|---|
| 1 | Par antes/después de un plato desconchado | Cenital, plato entero, desagüe visible, mismo punto de vista | Hero de portada y de `/platos-de-ducha/` |
| 2 | 3-6 pares de platos (grieta, golpe, óxido, pérdida de brillo, antideslizante, cambio de color) | Cenital + un detalle a 30 cm del daño | Galería del plato y apartados por daño |
| 3 | 2-4 pares por cada otro servicio (bañera, parcial, perforada, azulejos, patas, juntas, mampara, mármol) | Pieza entera de frente | Tarjetas de servicio, páginas de servicio, `/antes-y-despues/` |
| 4 | El esmaltador trabajando (mascarilla, pistola, cinta puesta) | Plano medio, sin cara si no quiere | Quiénes somos, hero de Hoteles |
| 5 | La cinta puesta alrededor de un plato antes de esmaltar | Cenital | Cómo trabajamos (paso 3) — refuerza la firma con una foto real |
| 6 | Certificado de garantía (sin datos personales) | Documento sobre la encimera | Franja de confianza (enlace), Quiénes somos, Hoteles |
| 7 | Furgoneta o material rotulado (si existe) | Lateral | Quiénes somos, pie |
| 8 | 1-3 baños de hotel renovados | Habitación con bañera | Hoteles y comunidades |

Mientras no lleguen (nunca hueco vacío ni «pendiente» visible en público):
- **Ilustraciones SVG propias** con la paleta, que dibuja el builder: trazo `ink-1` de 2 px, rellenos
  `surface-1`/`card`, daño en `warn`/`bad`, brillo en `card`, la cinta en `--color-tape`.
  - **«Plato partido»** (hero): plato visto desde arriba (rectángulo de esquinas romas con desagüe circular y
    rejilla), mitad izquierda con desconchón (mancha irregular `ink-1` con halo de óxido `warn`) y mitad
    derecha con dos reflejos de brillo; en medio, la cinta vertical con «ANTES · DESPUÉS».
  - **6 daños** (página del plato): grieta (línea quebrada), golpe (estrella pequeña), desconchón (mancha
    irregular), perforación (círculo con borde roto), manchas/óxido (halo ámbar), pérdida de brillo (superficie
    con trama mate frente a reflejo).
  - **Iconos de servicio** (9): plato cenital, bañera, bañera de patas, esmaltado parcial (bañera con zona
    marcada con cinta), perforada/óxido, azulejos (rejilla 3 × 3), juntas (línea de silicona en esquina),
    mampara (marco con cristal), mármol (veta); hoteles (puerta con número de habitación).
  - **Franja de confianza** (4): documento con firma (garantía), plato sin escombro (sin obras), auricular con
    «1» (un solo teléfono), edificio con ventanas (hoteles).
  - **¿Reparar o cambiar?**: pistola de esmalte + reloj corto frente a maza + saco de escombro.
  - **Zonas**: esquema de dos anillos concéntricos (capital / área metropolitana) con nombres; no es un mapa.
- **Huecos de galería:** en público, la ilustración del servicio con la etiqueta de cinta «ILUSTRACIÓN» y el
  pie «Pronto, fotos reales de este trabajo»; en modo pendientes, además el texto de qué foto va (PRD F4).
- **Nada de fotos de banco ni iconos de librería genérica.**

**Logotipo:** marca tipográfica `{{MARCA}}` en Archivo 800, `ink-1`, precedida de un símbolo: un plato visto
desde arriba (cuadrado de esquinas romas en `brand` con el desagüe como círculo `card`) atravesado por una
franja diagonal de cinta. En cabecera, 32 px de alto; en favicon, solo el símbolo.

## Patrones de pantalla

**Comunes a todas las páginas**
- **Cabecera fija** (Astryx `Layout`/`Stack` + `Link` + `Button`): símbolo + marca a la izquierda; a la
  derecha «Llamar» como `Button` secundario con icono de teléfono y el número visible desde 768 px (en móvil,
  solo icono + «Llamar»). Menú en `Drawer`/menú del sistema en móvil.
- **Botón flotante de WhatsApp** (`BotonFlotanteWhatsApp`, composición sobre `Button`): píldora abajo a la
  derecha, `brand` con glifo blanco y texto «WhatsApp» (≥ 48 px), `--shadow-1`; mensaje según ruta. Se oculta
  mientras el CTA de WhatsApp del hero esté en pantalla (para no duplicar) y nunca tapa el botón de enviar del
  formulario (deja margen inferior).
- **Un solo `Button` primario por pantalla**, y es WhatsApp. «Llamar» siempre secundario. Enviar formulario:
  primario solo dentro del bloque de formulario cuando el CTA de WhatsApp no está en pantalla.
- Pie con `Link`s agrupados.

**Por tipo de módulo**
- **Visual** (hero, antes/después): imagen o SVG a ancho completo en móvil, 55-60 % en escritorio con texto al
  lado; CTA justo debajo de la imagen y dentro de la misma pantalla.
- **Texto largo** (apartados por daño, legales): `--measure`, H2 que es la pregunta que se busca, párrafos de
  2-4 líneas, mini-ilustración a la izquierda en escritorio y encima en móvil; CTA en línea cada 2 apartados.
- **Cifras** (precios, nota de reseñas): número grande en mono, unidad y nota en `ink-3`; nunca una cifra
  inventada ni un «0».
- **Lista/proceso**: pasos con número en cinta, título en Archivo, una frase.
- **Tabla** («¿Reparar o cambiar?», tarifas): `Table` de Astryx; en móvil, 3 columnas máximo (concepto,
  reparar, cambiar) y sin scroll horizontal; cabecera «Reparar» en cinta.
- **Formulario**: `Field` + `TextInput`/`Select`/`Checkbox`/`TextArea` con etiqueta arriba, ayuda debajo y
  error junto al campo en `bad`; selector de pieza como `SegmentedControl` con iconos; adjuntar foto como
  botón grande «Añadir foto del daño» que abre cámara o galería; estados de envío, error (con teléfono y
  WhatsApp) y confirmación (`Banner` en `ok`).

**Por página**
- **Portada:** manda el hero (titular + imagen partida + WhatsApp). Sigue: confianza, resultado, comparación,
  proceso. Se esconde: técnica, historia, servicios secundarios (en tarjetas más abajo).
- **Platos de ducha:** manda el reconocimiento del daño (rejilla de 6) tras el hero. Sigue: apartados SEO.
  Se esconde: otros servicios (solo relacionados al final).
- **Servicio:** manda problema + CTA; sigue cómo y precio; se esconde lo genérico.
- **Hoteles:** manda la promesa sin cerrar habitaciones y la garantía; WhatsApp de empresa; se esconden los
  precios de particular.
- **Tarifas:** manda la tabla; se esconde el texto comercial.
- **Antes y después:** manda el filtro + rejilla; CTA tras cada 6 pares.
- **Contacto:** manda WhatsApp; formulario después; qué pasa con la foto, visible.

**Componentes Astryx usados:** `Layout`, `Stack`, `Heading`, `Text`, `Link`, `Button`, `Card`, `Badge`,
`Banner`, `Table`, `Field`, `TextInput`, `TextArea`, `Select`, `Checkbox`, `SegmentedControl`, `Image`,
`EmptyState` (404), y acordeón/`Disclosure` si D0 lo confirma.
**Composiciones nuevas** (con primitivas y tokens Astryx; se registran en `docs/astryx-componentes.md`):
`CintaEtiqueta`, `DeslizadorAntesDespues`, `PasosTrabajo`, `TablaRepararCambiar`, `FranjaConfianza`,
`TarjetaServicio`, `BotonWhatsApp`, `BotonFlotanteWhatsApp`, `CabeceraContacto`, `PrecioDesde`,
`BloqueResenas`, `ListaZonas`, `FormularioContacto` (+ `CampoFoto`), `GaleriaFiltrable`, `MigasDePan`,
`AcordeonFaq` (si D0 no trae acordeón), `IlustracionSvg` (familia de SVG del apartado Imágenes), `HuecoFoto`.

## Señales de confianza

| Dato real del cliente | Dónde | Mientras no exista |
|---|---|---|
| Teléfono y WhatsApp únicos | Cabecera, hero, flotante, pie, contacto | Modo borrador (`noindex`); en local `{{PENDIENTE}}` |
| Garantía (años y condiciones) | Franja, paso 4, Quiénes somos, Hoteles | «Garantía por escrito» sin plazo |
| Años de experiencia | Franja (5.º elemento), Quiénes somos | No aparece |
| Fotos antes/después reales | Hero, galerías, servicios | Ilustraciones SVG rotuladas «Ilustración» |
| Reseñas (nota, número, textos) | Portada, plato (2 citas) | Bloque oculto, sin AggregateRating |
| Referencias de hoteles | Hoteles y comunidades | Bloque oculto |
| Precios «desde» | Portada, Tarifas, servicios | «Pide presupuesto gratuito» + WhatsApp |
| Plazos (presupuesto, reparación, uso de la ducha) | Hero, pasos, FAQ | Textos alternativos del PRD |
| Retención de la foto | Bajo el CTA del hero, formulario, contacto, privacidad | Siempre existe (90 días por defecto) |
| Certificado de garantía (foto) | Quiénes somos, Hoteles | Ilustración de documento firmado |

## Textos

- **Tono:** tú, frases de menos de 15 palabras, verbos de oficio («reparamos», «esmaltamos», «te decimos»).
  Nunca «usted», nunca «soluciones integrales», nunca promesas sin dato.
- **Cómo se nombra al usuario:** «tú»; en Hoteles, «tu hotel», «tu comunidad».
- **CTA:** «Manda la foto por WhatsApp» · «Llamar» · «Manda la foto del tuyo» · «Enviar petición».
- **Ayuda de campos:** foto «Con una foto del daño te decimos si tiene arreglo. Máximo 10 MB.»; teléfono
  «Te llamamos o escribimos a este número».
- **Vacíos:** sin reseñas → el bloque no aparece; galería filtrada sin fotos → `EmptyState` de Astryx con título
  «Aún no hemos subido fotos de este trabajo.», descripción «Mándanos la tuya y te decimos qué podemos hacer.» y
  WhatsApp en actions.
- **Errores:** «Falta tu teléfono.» · «El teléfono tiene que tener 9 cifras.» · «Marca la casilla de
  privacidad para enviar.» · «La foto pesa más de 10 MB; prueba con otra o envíala por WhatsApp» · «Solo se
  admiten fotos (JPG, PNG, WebP o HEIC)» · «Has enviado varias peticiones; llámanos o escríbenos por
  WhatsApp» · caída: «No hemos podido enviar tu petición. No has perdido nada: llámanos o mándanos la foto por
  WhatsApp.» (textos exactos del PRD donde existen).
- **Confirmación:** «Recibido. Te respondemos lo antes posible.» (o el plazo confirmado) + «¿Quieres
  adelantar la foto? Mándala por WhatsApp».

## Lista de comprobación visual

1. En 360 × 740, la primera pantalla de la portada muestra etiqueta de cinta, H1 con «plato de ducha», la
   imagen (foto o SVG «plato partido») y los botones «WhatsApp» y «Llamar» sin hacer scroll.
2. En cada pantalla hay un solo botón primario, en `brand` #0A6E64 con texto blanco, y es de WhatsApp.
3. El botón flotante de WhatsApp aparece en todas las páginas en móvil, con sombra, y no tapa el botón de
   enviar del formulario.
4. Ningún texto visible en el build público dice «PENDIENTE», «{{», «0 años» ni muestra un contador sin cifra.
5. La cinta crema aparece en el hero, en el asa y etiquetas del antes/después, en los números de «Cómo
   trabajamos» y en la cabecera «Reparar» de la tabla; en ningún otro sitio.
6. La portada tiene la franja de confianza con 4 compromisos e iconos propios justo debajo del hero.
7. La portada muestra «¿Reparar o cambiar?» antes de «Cómo trabajamos», sin scroll horizontal en 320 px.
8. El fondo es porcelana cálida (#FBFAF6 / #F3F0E7 alternando por secciones), no blanco puro ni gris frío; las
   tarjetas son blancas sobre `surface-1`.
9. Los titulares están en Archivo pesada y el texto en Figtree a 16 px o más; precios y «PASO N» en mono.
10. Junto al CTA del hero y en el formulario se lee cuántos días se guarda la foto; el mismo número aparece en
    `/privacidad/`.
11. Ninguna imagen es de banco: o es foto del cliente o es una ilustración SVG con la paleta (las de galería,
    rotuladas «Ilustración»).
12. En modo oscuro (sistema), fondo #0F1716, texto #F3F1EA y botón #4CC2B1 con texto oscuro; la cinta sigue
    crema con texto oscuro.
