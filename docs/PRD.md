# PRD: Duchas 2 — web de reparación y esmaltado de platos de ducha en Madrid

Fecha: 2026-11-14 · Revisión 1 · Fuentes: `docs/vision.md` (fuente principal) y `docs/research.md`.

## Introducción: la visión de la persona

Este PRD respeta la visión inicial tal como se dio. Las ideas clave, en palabras de la visión:

> «Web comercial en React para una empresa de Madrid que repara y esmalta platos de ducha, bañeras y
> sanitarios sin obras ni polvo, con catálogo de servicios, preguntas frecuentes, galería antes/después y
> contacto por teléfono y WhatsApp; toma como referencia de contenido y estructura la web de Repaban
> (repaban.es) y la supera en claridad, SEO y conversión.»

> «Quien tiene el plato roto cree que hay que cambiarlo (obra, polvo, 900-1.500 €). La web tiene que
> explicar en dos minutos que se repara y esmalta en el sitio, en pocas horas, con garantía por escrito,
> y convertir esa visita en una llamada o un WhatsApp con foto del daño.»

> «Honesto: no prometer plazos ni precios que el cliente no confirme; donde falte el dato, texto
> provisional marcado como {{PENDIENTE}}.»

Decisiones de la visión que este PRD no cambia:
- Los platos de ducha son el **servicio principal** y el primero del catálogo.
- React, HTML estático por página, design system **Astryx** (sin DS propio ni HTML suelto).
- Un solo teléfono y un solo WhatsApp en todo el sitio; `{{MARCA}}` y `{{PENDIENTE}}` donde falten datos.
- Tono en «tú», frases cortas, honesto: no se publican precios, plazos, años ni reseñas sin confirmar.
- Contenido en ficheros de datos editables sin tocar componentes.
- Todo funciona y se prueba en local, sin servicios de pago.
- El alcance del MVP son las 5 funcionalidades sugeridas en la visión.

Las mejoras que surgieron del discovery fueron propuestas y la persona las aceptó todas (decisión:
«todas»). Están incorporadas como decisiones en la sección **Propuestas de cambio aceptadas** y en los
criterios de F1, F2 y F4 que las recogen.

### Regla común: datos confirmados y textos alternativos

Todo plazo, precio, cifra o promesa comercial sale del fichero de contacto/negocio y solo se muestra si
está marcado como confirmado por el cliente. Si no lo está, se muestra un texto alternativo fijo que no
promete nada. Esta tabla es vinculante para F1-F5:

| Dato | Texto si está confirmado (ejemplo) | Texto alternativo si NO está confirmado |
|---|---|---|
| Plazo de presupuesto | «Presupuesto gratuito en 24 h» | «Presupuesto gratuito y sin compromiso» |
| Duración de la reparación | «Reparado en unas horas» / «en el día» | «Sin obras ni polvo» |
| Plazo de respuesta al formulario | «Te respondemos en menos de 24 h» | «Te respondemos lo antes posible» |
| Años de experiencia | «{N} años reparando baños» | Se oculta el dato (no se muestra cifra) |
| Garantía | «Garantía por escrito de {N} años» | «Garantía por escrito» + `{{PENDIENTE}}` del plazo |
| Precio «desde» | «Desde {X} €» | «Pide presupuesto gratuito» |

En el entorno local de desarrollo los huecos pueden verse como `{{PENDIENTE}}` para que el cliente
los detecte; el texto alternativo es lo que ve el visitante en el build de producción. Un criterio
de aceptación que mencione un plazo se cumple con cualquiera de las dos columnas según el estado del dato.

## 1. Objetivo y propuesta de valor

**Objetivo del MVP:** que un particular de Madrid que llega desde el móvil con el plato de ducha dañado
entienda en menos de dos minutos que se puede reparar sin obra y con garantía, y escriba por WhatsApp con
foto, llame o rellene el formulario.

**Propuesta de valor:** reparar y esmaltar el plato de ducha (y la bañera o los azulejos) en casa, sin
obras ni polvo, por bastante menos que cambiarlo, con presupuesto gratuito a partir de una foto y garantía
por escrito.

**Por qué ahora y por qué gana** (evidencia de `docs/research.md`):
- Ningún competidor de Madrid (Repaban, Redesban, Vilasmalt, Caldisban) tiene el plato de ducha como
  servicio principal; todos lo citan de pasada.
- Ninguno publica precios ni reseñas propias, y casi ninguno da plazo de garantía. Repaban tiene dos
  teléfonos distintos y copyright 2019.
- El sustituto (cambiar bañera por plato) cuesta 865-1.200 € en Madrid; esmaltar una bañera cuesta
  150-400 € según portales. Esa diferencia es el argumento de venta.

**Métricas de éxito del MVP** (comprobables en local):
- Desde la portada en móvil (360 px), los botones «Llamar» y «WhatsApp» se ven sin hacer scroll.
- Lighthouse móvil ≥ 90 en las cuatro métricas en portada, página de platos de ducha y FAQ.
- Un formulario enviado llega por email (Mailpit en local) y queda guardado en local.

## 2. Avatar

**Marta Gil, 47 años, Carabanchel (Madrid).** Administrativa; vive con su pareja y dos hijos
adolescentes en un piso de los 80 con un plato de ducha de porcelana al que se le cayó un bote de cristal:
tiene un desconchón con una mancha de óxido que crece. Busca desde el móvil, en el baño, con la avería
delante: «plato de ducha desconchado arreglar».

- **Qué quiere:** saber si se puede arreglar sin cambiar el plato, cuánto le costará más o menos, y
  mandar una foto para que le digan algo rápido, sin tener que explicarlo por teléfono en horario de
  trabajo.
- **Qué le frustra:** pensar que tiene que levantar azulejos y pagar más de 1.000 €; webs con textos
  largos y en «usted» que no dicen precio; no saber si el número al que llama es el bueno; pedir
  presupuesto en un portal y recibir cinco llamadas de desconocidos; no saber cuánto tiempo estará sin
  ducha.

**Visitante secundario:** Javier, responsable de mantenimiento de un hotel de 60 habitaciones en
Madrid centro, que necesita renovar 15 bañeras sin cerrar habitaciones más de un día. Le interesa la
página «Hoteles y comunidades», las referencias y la garantía por escrito.

## 3. Alcance del MVP

Cinco funcionalidades, las de la visión. Todo el contenido sale de ficheros de datos; donde falte el
dato del cliente se aplica la regla común de datos confirmados (arriba).

### D0. Dependencia obligatoria previa: validación de Astryx (bloquea F1, F2, F4 y F5)

No es una funcionalidad para el usuario, es una puerta. Antes de construir componentes de F1, F2, F4 y F5:

- El arquitecto fija la versión exacta de `@astryxdesign/core` en `package.json` y lista sus componentes
  con su CLI (`npx @astryxdesign/cli component --list` o equivalente documentado).
- Deja en `docs/astryx-componentes.md` una tabla con estas piezas y, para cada una, qué componente de
  Astryx se usa: botón, enlace, tarjeta, titular/texto, layout/stack, **acordeón/desplegable** (FAQ),
  **deslizador antes/después**, **campo de texto, desplegable de selección, casilla, adjuntar archivo,
  área de texto, mensaje de error de campo** (formulario), banner (cookies) e imagen.
- **Alternativa aprobada** si falta una pieza: componerla con componentes primitivos de Astryx
  (Stack, Box/Layout, Button, Text…) y solo sus tokens (`--color-*`, `--font-*`, `--spacing-*`), en un
  componente propio del proyecto documentado en esa tabla. Esto cumple la visión (se compone con Astryx,
  no es un DS propio). Para el deslizador y los campos, el elemento nativo mínimo imprescindible
  (`input type="range"`, `input`, `select`, `input type="file"`) se envuelve en esa composición y se
  estiliza solo con tokens de Astryx.
- Si una pieza no puede resolverse ni así, el trabajo se para y se pregunta a la persona (pregunta
  abierta 13) antes de seguir con la funcionalidad afectada.

Criterios de aceptación:
- Existe `docs/astryx-componentes.md` con la versión fijada y una fila por cada pieza listada, con
  «componente Astryx» o «composición con primitivas» y su nombre.
- Una búsqueda en el código de colores, tamaños de fuente o espaciados escritos a mano (fuera de tokens
  de Astryx) no devuelve resultados.

### F1. Portada completa

Hero con titular de beneficio y botones «Llamar» y «WhatsApp»; franja de confianza; catálogo de servicios
en tarjetas (plato de ducha primero); «cómo trabajamos» en 4 pasos; antes/después con deslizador; precios
«desde»; reseñas; FAQ resumida; zonas; formulario.

Criterios de aceptación:
- En un móvil de 360 px, sin hacer scroll, el usuario ve el titular, «Llamar» y «WhatsApp».
- El titular habla de reparar sin obras y con garantía; solo dice «en el día» o «en unas horas» si la
  duración está confirmada en datos; si no, usa el texto alternativo de la tabla.
- Los botones «Llamar» y «WhatsApp» miden al menos 44 × 44 px y abren `tel:` y `wa.me` con el número del
  fichero de contacto.
- La franja de confianza muestra garantía por escrito, «sin obras» y «hoteles»; los años solo aparecen
  si están confirmados y el plazo de garantía sigue la tabla de textos alternativos.
- La primera tarjeta del catálogo es «Reparación y esmaltado de platos de ducha»; hay una tarjeta por
  servicio del fichero de datos y cada una lleva a su página.
- El bloque «cómo trabajamos» muestra 4 pasos en este orden: foto por WhatsApp → presupuesto → reparación
  → garantía. El paso 2 dice «en 24 h» y el paso 3 «en unas horas» solo si esos plazos están
  confirmados; si no, se ven «Presupuesto gratuito y sin compromiso» y «Reparación sin obras ni polvo».
- Al cambiar en el fichero de datos un plazo de «no confirmado» a «confirmado» y regenerar el sitio, el
  texto de la portada cambia sin tocar componentes.
- El usuario puede arrastrar el deslizador antes/después con el dedo y moverlo con las flechas del
  teclado; hay un enlace a la galería completa.
- El bloque de precios muestra los importes «desde» confirmados; si no hay ninguno, muestra el texto
  alternativo de presupuesto y un botón de WhatsApp.
- Se ven las reseñas del fichero con nota media y número de opiniones; la nota mostrada coincide con la
  de los datos estructurados. Si el fichero no tiene reseñas, el bloque no aparece y no se emite
  AggregateRating.
- La FAQ resumida muestra entre 4 y 6 preguntas que se abren y cierran al tocarlas (y con teclado) y
  enlaza a la FAQ completa.
- Hay un bloque «¿Reparar o cambiar?» con una tabla corta de coste, tiempo y obra (reparación frente a
  sustitución); las cifras salen del fichero de datos y siguen la regla de datos confirmados; sin
  cifras confirmadas, la tabla compara solo tiempo y obra («sin obras ni polvo» frente a obra).
- No hay scroll horizontal entre 320 y 1440 px.

### F2. Página de reparación y esmaltado de platos de ducha

Página larga y trabajada para SEO: daños (grieta, golpe, desconchón, perforación, manchas, pérdida de
brillo), cambio de color, antideslizante, materiales que se reparan, proceso, precio orientativo,
antes/después del servicio, FAQ propia y llamada a la acción.

Criterios de aceptación:
- La página tiene un único H1 que incluye «plato de ducha» y «Madrid», y un title y description únicos.
- El usuario encuentra un apartado por cada daño de la lista y uno de antideslizante y cambio de color.
- Se ve el mismo bloque «¿Reparar o cambiar?» de la portada, resumido y sin páginas por barrio.
- Se ve la lista de materiales que se reparan; un material no confirmado por el cliente no aparece como
  reparable (en local se ve `{{PENDIENTE}}`).
- Hay al menos 5 preguntas frecuentes del plato de ducha (cuánto dura, cuándo se puede usar la ducha,
  qué materiales, antideslizante, golpe/desconchón y óxido) desplegables; las respuestas con plazos
  siguen la tabla de textos alternativos.
- El botón de WhatsApp de esta página abre un mensaje precargado que menciona la página de platos de
  ducha y pide la foto del daño.
- Hay una galería antes/después con solo fotos del servicio «platos de ducha» (o huecos marcados con el
  tamaño definitivo y qué foto va).
- Al ver el código de la página se encuentran datos estructurados Service, FAQPage y BreadcrumbList
  válidos (pasan el validador de schema.org), y las migas de pan se ven en pantalla.
- Lighthouse móvil ≥ 90 en las cuatro métricas.

### F3. Páginas del resto de servicios y «Hoteles y comunidades»

Ocho páginas de servicio (bañeras completas, esmaltado parcial, perforadas y óxido, azulejos, bañeras de
patas, juntas y sellado, mamparas, mármol y piedra) más «Hoteles y comunidades», todas con la misma
plantilla y generadas desde el fichero de servicios.

Criterios de aceptación:
- Existe una página por cada servicio del fichero; al añadir un servicio nuevo al fichero y regenerar el
  sitio, aparece su página y su tarjeta sin tocar componentes.
- Cada página muestra: qué problema resuelve, cómo se hace, precio «desde» confirmado o el texto
  alternativo, antes/después del servicio, 2-4 preguntas propias y botones de llamada y WhatsApp.
- El WhatsApp de cada página lleva un mensaje precargado que nombra ese servicio.
- Cada página tiene title, description y canonical únicos, y datos Service y BreadcrumbList.
- «Hoteles y comunidades» explica cómo se renuevan baños sin cerrar habitaciones, muestra las
  referencias del fichero (si no hay, el bloque no aparece) y un WhatsApp con mensaje para empresas.
- Al final de cada página se ven enlaces a 2-3 servicios relacionados.

### F4. Páginas de soporte: FAQ, Tarifas, Antes y después, Quiénes somos, Zonas, Contacto y legales

Criterios de aceptación:
- **FAQ:** muestra todas las preguntas del fichero agrupadas por tema, desplegables, con datos
  FAQPage; incluye las 7 de la referencia adaptadas al plato de ducha y las propias de la visión.
- **Tarifas:** tabla de precios «desde» por trabajo con la nota «precio orientativo; el presupuesto final
  depende del daño»; los trabajos sin precio confirmado muestran el texto alternativo de presupuesto.
- **Antes y después:** el usuario filtra la galería por servicio y solo ve las fotos de ese servicio;
  cada foto tiene alt descriptivo; los huecos sin foto muestran qué foto va.
- **Quiénes somos:** forma de trabajar, años (solo si confirmados) y garantía con plazo y condiciones
  según la tabla de textos alternativos.
- **Zonas donde trabajamos:** lista de Madrid capital y municipios del área metropolitana del fichero.
- **Contacto:** un único teléfono, un único WhatsApp, email, horario y formulario.
- **Aviso legal, privacidad y cookies:** existen, enlazados desde el pie; muestran razón social, NIF y
  domicilio del fichero (o `{{PENDIENTE}}`).
- **Privacidad y conservación:** la página de privacidad indica responsable, finalidad, base legal y el
  plazo de conservación de peticiones y fotos, que se lee del mismo valor de configuración que usa el
  borrado automático de F5 (por defecto 90 días). Al cambiar ese valor y regenerar, el texto cambia.
- En todo el sitio el teléfono que se ve es el mismo: se busca el número en cualquier página y solo
  aparece el del fichero de contacto.
- El sitio genera en el build `sitemap.xml` con todas las páginas, `robots.txt`, Open Graph por página y
  LocalBusiness en la portada.
- **Modo borrador:** mientras queden `{{PENDIENTE}}` en aviso legal, teléfono o garantía, el build
  añade `noindex` a todas las páginas y muestra por consola un aviso que lista los datos que faltan; con
  todo completo, el build no añade `noindex` ni avisa.
- Sin analítica configurada no aparece banner de cookies; al pegar un ID de GA4 en la configuración
  aparece un banner con «Aceptar» y «Rechazar» igual de visibles y GA4 no se carga hasta aceptar.

### F5. Contacto y conversión

WhatsApp precargado por página, teléfono con `tel:` y horario, y formulario con foto que envía email y
guarda la petición en local.

Entorno: el sitio es Next.js con exportación estática (decisión aceptada) y en el MVP el envío lo
atiende un pequeño servicio Node propio que corre **solo en local**, y el
email sale a **Mailpit** en local (SMTP normal configurable por variables de entorno para cuando se
despliegue). No se contrata ni se configura ningún servicio externo.

Valores fijados (configurables por variable de entorno, estos son los valores por defecto):
- Foto: **una** foto opcional, formatos JPEG, PNG, WebP o HEIC, **máximo 10 MB**.
- Límite: **5 envíos por IP en una ventana de 60 minutos**.
- Conservación: **90 días** (pendiente de confirmar por el cliente, pregunta abierta 8).

Criterios de aceptación:
- El formulario pide nombre, teléfono, tipo de pieza (plato de ducha, bañera, azulejos, otro), daño,
  foto opcional, zona y mensaje, más una casilla obligatoria de aceptación de la privacidad con enlace.
- Si el usuario deja vacío nombre o teléfono, no marca la casilla, o el teléfono no tiene formato válido
  (9 dígitos españoles, con o sin +34), ve un mensaje junto al campo y el formulario no se envía. Si la
  validación llega al servidor y falla, responde **HTTP 400** con el campo erróneo y el usuario ve el
  mensaje junto a ese campo.
- El usuario puede adjuntar una foto desde la cámara o la galería del móvil. Si la foto supera 10 MB ve
  «La foto pesa más de 10 MB; prueba con otra o envíala por WhatsApp» antes de enviar; si el servidor
  recibe un archivo mayor responde **HTTP 413** y se ve el mismo aviso. Si no es JPEG, PNG, WebP o HEIC
  ve «Solo se admiten fotos (JPG, PNG, WebP o HEIC)» y el servidor responde **HTTP 415**.
- Al enviar con éxito (**HTTP 201**), el usuario ve una confirmación con el plazo de respuesta según la
  tabla de textos alternativos y un botón de WhatsApp por si quiere adelantar la foto.
- La empresa recibe un email con todos los campos y la foto adjunta (comprobable en Mailpit en local), y
  la petición queda guardada en local con su foto.
- Un envío con el campo trampa (honeypot) relleno recibe la misma respuesta de éxito (HTTP 201) para no
  dar pistas, pero no genera email ni se guarda.
- El sexto envío desde la misma IP dentro de 60 minutos responde **HTTP 429** sin enviar email ni guardar,
  y el usuario ve «Has enviado varias peticiones; llámanos o escríbenos por WhatsApp» con ambos botones.
  Pasada la ventana, vuelve a poder enviar.
- Si el envío falla (servidor caído o **HTTP 5xx**), el usuario ve un mensaje de error con el teléfono y
  el WhatsApp, y no pierde lo que escribió.
- **Borrado automático:** las peticiones y sus fotos con más días que el plazo configurado se borran
  solas (al arrancar el servicio y una vez al día). Prueba: con el plazo a 0 días o con una petición de
  fecha antigua, tras ejecutar la limpieza ni la petición ni su foto existen en el almacenamiento local;
  una petición reciente sigue ahí.
- El botón flotante de WhatsApp en móvil está en todas las páginas y su mensaje cambia según la página.

## 4. Después del MVP

- Páginas por distrito y municipio de Madrid (reutilizando los datos de zonas del producto `duchas`).
- Panel de administración con contraseña para ver peticiones y editar servicios, precios, reseñas y
  galería.
- Reseñas de Google automáticas (Places API, tiene coste por uso) con caché y fichero de respaldo.
- Blog con plantilla SEO y 10 artículos.
- Calculadora orientativa de presupuesto que termine en WhatsApp precargado.
- Mapa de zonas (OpenStreetMap/Leaflet).
- Despliegue en producción: dominio (de pago, ~10-15 €/año), hosting del front estático y alojamiento
  del servicio del formulario con SMTP real.
- Analítica autoalojada (Plausible/Umami) si no se usa GA4.

## 5. Historias de usuario

1. Como Marta, con el plato desconchado delante, quiero ver en la primera pantalla del móvil que se
   repara sin obra y un botón de WhatsApp, para mandar la foto en un minuto.
2. Como Marta, quiero saber un precio «desde» antes de escribir, para comprobar que reparar me sale mucho
   más barato que cambiar el plato.
3. Como Marta, quiero ver fotos de antes y después de platos como el mío, para creer que queda bien.
4. Como Marta, quiero saber cuánto tiempo estaré sin ducha y qué garantía me dan por escrito, para
   decidirme.
5. Como Marta, quiero rellenar un formulario con foto fuera de horario, para que me llamen al día
   siguiente sin tener que explicarlo todo.
6. Como Marta, quiero saber si trabajan en Carabanchel, para no perder el tiempo.
7. Como Marta, quiero saber cuánto tiempo guardan la foto de mi baño, para fiarme de mandarla.
8. Como Javier (hotel), quiero una página que explique cómo renuevan baños sin cerrar habitaciones y con
   referencias, para pedir presupuesto para 15 bañeras.
9. Como visitante que busca «esmaltar bañera precio», quiero llegar a una página de tarifas clara, para
   no tener que pedir presupuesto en un portal.
10. Como dueño de {{MARCA}}, quiero cambiar precios, plazos, reseñas, servicios y fotos editando ficheros
    de datos según el README, sin tocar componentes.
11. Como dueño de {{MARCA}}, quiero recibir cada petición por email con la foto, para presupuestar sin
    desplazarme.

## 6. Riesgos y dependencias

**Dependencia técnica bloqueante:**
- D0 (validación de Astryx) debe estar cerrada antes de construir F1, F2, F4 y F5. Astryx es beta, su
  versión actual no está clara y solo documenta Next.js y Vite; la investigación no confirma acordeón,
  deslizador ni campos de formulario.

**Dependencias del cliente (bloquean publicar, no construir):**
- Nombre comercial, logo, razón social, NIF y domicilio (aviso legal, LSSI art. 10).
- Un teléfono, un WhatsApp, un email y horario.
- Años de experiencia y duración y condiciones de la garantía.
- Plazos reales: presupuesto, respuesta, duración de la reparación y tiempo antes de usar la ducha.
- Materiales que repara de verdad (la reparación de grietas en resina es discutible y no se promete sin
  confirmar).
- Precios «desde» que acepta publicar.
- Zonas reales.
- 10-20 fotos antes/después horizontales por servicio; reseñas reales y enlace a «escribir reseña».
- Referencias de hoteles o comunidades.

**Legales:**
- RGPD del formulario con fotos de viviendas: texto de privacidad, base legal y plazo de conservación con
  borrado automático (en el MVP, 90 días configurables hasta que el cliente confirme).
- Cookies: sin analítica no hay banner; con GA4, consentimiento previo.
- Reseñas, años y precios deben ser reales; los datos estructurados deben coincidir con lo visible.
- No copiar textos, nombres ni fotos de Repaban u otros competidores.

**Técnicos:**
- Next.js con exportación estática (decisión aceptada): el formulario (SMTP, foto, límite por IP) necesita un servicio Node
  aparte, que en el MVP corre solo en local con Mailpit.
- Sitemap y robots: generarlos en un script de build en vez de con la ruta dinámica de Next.
- Lighthouse ≥ 90 depende de que las fotos del cliente se compriman a WebP con tamaño fijo.
- Las fotos HEIC del iPhone se aceptan como adjunto del email; no se muestran en la web.

**Adopción:**
- Habitissimo y Cronoshare dominan las búsquedas de precio; una web nueva tardará meses en posicionar.
- Sin fotos ni reseñas reales, la portada pierde su argumento principal.
- Si el cliente no confirma plazos ni precios, los textos alternativos dejan la web igual de prudente que
  la competencia en esos puntos; el diferencial queda en el plato de ducha, la conversión móvil y el
  único teléfono.

## 7. Propuestas de cambio aceptadas

La persona decidió «todas»: las tres propuestas del discovery son ahora decisiones del PRD.

1. **Bloque «¿Reparar o cambiar?» en la página de platos de ducha y en la portada (aceptada).** Tabla
   corta de coste, tiempo y obra: reparación frente a sustitución (865-1.200 € en Madrid según
   Cronoshare). Argumento: la investigación lo marca como diferenciador complementario y desmonta la
   creencia de Marta. Impacto: una sección más en datos y plantilla, coste bajo; se evita pisar el
   producto `duchas` con un bloque resumido sin páginas por barrio. Recogido en F1 y F2.
2. **Next.js con exportación estática más un pequeño servicio Node para el formulario (aceptada).**
   Argumento: es la única combinación con guía oficial de Astryx; con Astro no está documentado. El
   servicio hace SMTP, foto y límite por IP, y el sitemap se genera en el build. Impacto: dos procesos en
   local en vez de uno; menos riesgo que Astro con StyleX sin probar. Recogido en F5 y en Riesgos.
3. **Modo borrador hasta tener los datos legales (aceptada).** Mientras queden `{{PENDIENTE}}` en aviso
   legal, teléfono o garantía, el sitio sale con `noindex` y el build avisa de lo que falta. Argumento: sin
   razón social y NIF no se puede publicar (LSSI art. 10) y las cifras sin confirmar son un riesgo legal.
   Impacto: coste bajo; evita indexar una web con huecos o datos inventados. Recogido en F4.

## 8. Propuestas descartadas por la persona

Ninguna: la persona aceptó todas las propuestas.

## 9. Preguntas abiertas

1. ¿Nombre comercial, logo, razón social, NIF y domicilio para el aviso legal?
2. ¿Cuál es el teléfono, el WhatsApp, el email y el horario únicos?
3. ¿Cuántos años de experiencia y cuánto dura la garantía? ¿Qué cubre?
4. ¿Qué materiales de plato repara de verdad (resina, carga mineral, acrílico, cerámica, piedra, hierro)?
   ¿Repara grietas en resina?
5. ¿Qué precios «desde» acepta publicar? Si no acepta ninguno, ¿se mantiene la página de Tarifas con el
   texto alternativo o se quita del menú?
6. ¿Cuánto tiempo hay que esperar para usar la ducha tras la reparación?
7. ¿El presupuesto por foto es orientativo o vinculante?
8. ¿Acepta conservar peticiones y fotos 90 días (valor por defecto del MVP) o prefiere otro plazo?
9. ¿Qué zonas cubre de verdad? ¿Puede comprometerse a «presupuesto en 24 h», «respuesta en 24 h» y
   «reparación en unas horas / en el día»?
10. ¿Le valen los límites del formulario fijados para el MVP (foto de 10 MB, 5 envíos por IP y hora) o
    quiere otros?
11. ¿Se activa GA4 en el MVP (con banner) o se lanza sin analítica?
12. ¿Hay fotos antes/después, reseñas reales y referencias de hoteles disponibles ya?
13. Si D0 revela que Astryx no permite resolver una pieza (por ejemplo el deslizador o el campo de
    archivo) ni componiendo con sus primitivas, ¿se acepta un componente local mínimo estilizado con sus
    tokens o se quita esa pieza del MVP?
