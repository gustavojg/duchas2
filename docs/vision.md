Duchas 2: prompts para la fábrica
Documento de trabajo. Lo que va en cada campo de la pantalla Nueva idea → Escribirlo yo mismo (id, idea en una frase y visión inicial). Fecha: 2026-11-14.

Referencia de contenido analizada: https://www.repaban.es (home, /servicios/, /preguntas-frecuentes/, /quienes-somos/). Lo que se toma de ahí es la estructura de servicios, las preguntas frecuentes y los argumentos de venta; el texto, el nombre y las fotos son nuestros. No se copia ningún texto literal.

Diferencia con el producto duchas ya existente (node-hono-sqlite, Astro/Eleventy): duchas gira en torno a «reparar vs. cambiar» con páginas por barrio. Duchas 2 es un sitio de empresa de esmaltado y reparación con catálogo de servicios al estilo Repaban, hecho en React con el design system Astryx.

1. Prompt principal (pantalla «Escribirlo yo mismo»)
Campo «id del proyecto nuevo»
duchas2
Campo «La idea en una o dos frases»
Web comercial en React para una empresa de Madrid que repara y esmalta platos de ducha, bañeras y
sanitarios sin obras ni polvo, con catálogo de servicios, preguntas frecuentes, galería antes/después y
contacto por teléfono y WhatsApp; toma como referencia de contenido y estructura la web de Repaban
(repaban.es) y la supera en claridad, SEO y conversión.
Campo «Visión inicial»
Copiar entero.

PARA QUIÉN ES
- Cliente del producto: empresa de restauración de platos de ducha, bañeras y sanitarios en Madrid
  (nombre comercial pendiente; usar {{MARCA}} en todo el sitio hasta que lo dé).
- Visitantes de la web, por prioridad:
  1. Particulares con un plato de ducha o bañera dañado (grieta, desconchón, golpe, óxido, perforación,
     pérdida de brillo, color anticuado) que buscan arreglarlo sin obra. Llegan desde el móvil con la
     avería delante.
  2. Hoteles, comunidades y administradores de fincas que necesitan renovar muchos baños sin cerrar
     habitaciones ni levantar azulejos.

QUÉ PROBLEMA RESUELVE
Quien tiene el plato roto cree que hay que cambiarlo (obra, polvo, 900-1.500 €). La web tiene que
explicar en dos minutos que se repara y esmalta en el sitio, en pocas horas, con garantía por escrito,
y convertir esa visita en una llamada o un WhatsApp con foto del daño.

REFERENCIA DE CONTENIDO: REPABAN (https://www.repaban.es)
El investigador debe leerla completa (home, Servicios, Esmaltar bañera, Antes y Después, Preguntas
Frecuentes, Quiénes somos, Contacto) y sacar la estructura de servicios, los argumentos repetidos y las
preguntas que responde. Lo que ya he visto allí y quiero reproducir mejorado:
- Catálogo de 8 servicios en tarjetas con foto: esmaltado de bañeras, esmaltado parcial (desconchones),
  reparación de bañeras perforadas y óxido, esmaltado de azulejos, restauración de bañeras de patas,
  renovación de juntas, instalación de mamparas, pulido de mármol. Los platos de ducha aparecen solo de
  pasada: en nuestro sitio son el SERVICIO PRINCIPAL y el primero del catálogo.
- Argumentos: «sin obras ni polvo», «en pocas horas», «económico», «certificado de garantía en todos los
  trabajos», productos y técnicas nuevos, base anticorrosión antes de esmaltar, trabajo para hoteles,
  más de 20 años de experiencia (en el nuestro, los años que confirme el cliente).
- FAQ con 7 preguntas: si recupera el brillo, qué hacer con un golpe o desconchón (y la urgencia de
  arreglarlo antes de que el óxido perfore), si se puede cambiar el color, óxido en el desagüe,
  perforaciones (riesgo de filtración al vecino), moho en juntas, bañeras de patas antiguas. Las
  reutilizamos adaptadas al plato de ducha y añadimos las nuestras (cuánto dura, cuándo se puede usar la
  ducha, qué materiales se reparan: resina, acrílico, cerámica, piedra; antideslizante).
- Lo que Repaban hace MAL y nosotros corregimos: teléfonos distintos en cabecera y pie, sin formulario,
  sin presupuesto gratuito visible, sin precios orientativos, sin reseñas, sin zonas de servicio, textos
  largos en «usted» con erratas, galería antes/después en otra página en vez de en la portada, copyright
  de 2019. Nuestro sitio tiene un solo teléfono y un solo WhatsApp en todo el sitio, formulario con foto
  del daño, bloque «presupuesto gratuito en 24 h», precios «desde», reseñas, zonas y antes/después en la
  portada.

SERVICIOS (cada uno con página propia; el primero es el principal)
1. Reparación y esmaltado de platos de ducha (grietas, golpes, desconchones, perforaciones, manchas,
   pérdida de brillo, cambio de color, tratamiento antideslizante). Página larga, muy trabajada en SEO.
2. Esmaltado completo de bañeras.
3. Reparación de desconchones y golpes (esmaltado parcial).
4. Bañeras perforadas y tratamiento del óxido.
5. Esmaltado de azulejos y cambio de color del baño sin obra.
6. Restauración de bañeras de patas antiguas.
7. Renovación de juntas y sellado (moho, silicona, filtraciones).
8. Instalación de mamparas.
9. Pulido de mármol y piedra.
Más una página «Hoteles y comunidades» con el argumento de renovar baños sin cerrar habitaciones.

ESTRUCTURA DE LA WEB
- Portada: hero con titular de beneficio (reparar sin obras, en el día, con garantía) y botones
  «Llamar» y «WhatsApp» visibles sin scroll en móvil; franja de confianza (años, garantía por escrito,
  sin obras, hoteles); catálogo de servicios en tarjetas; bloque «cómo trabajamos» en 4 pasos (foto por
  WhatsApp → presupuesto en 24 h → reparación en unas horas → garantía); galería antes/después con
  deslizador; precios orientativos «desde»; reseñas; FAQ resumida; zonas de servicio; formulario.
- Páginas: una por servicio, Hoteles y comunidades, Antes y después (galería completa filtrable por
  servicio), Preguntas frecuentes (con schema FAQPage), Tarifas orientativas, Quiénes somos, Contacto,
  aviso legal, privacidad y cookies.
- Zonas: Madrid capital y área metropolitana. En el MVP una sola página «Zonas donde trabajamos» con la
  lista; las páginas por barrio o municipio quedan para después (ya existen en el producto `duchas`).
- SEO: palabras clave a cubrir (el investigador las amplía): reparar plato de ducha Madrid, reparación
  platos de ducha, plato de ducha roto, grieta plato de ducha, esmaltar plato de ducha, esmaltado de
  bañeras Madrid, reparación de bañeras Madrid, esmaltar bañera precio, desconchón bañera, bañera
  oxidada, esmaltar azulejos sin obra, antideslizante plato de ducha, cambiar color bañera, restaurar
  bañera de patas. Title y description únicos por página, canonical, sitemap, robots, Open Graph,
  schema.org LocalBusiness, Service, FAQPage y BreadcrumbList, imágenes WebP con alt.

TÉCNICO (decidido)
- React. Debe generar HTML estático por página para el SEO (Next.js con exportación estática, o
  Astro con islas React si el arquitecto lo justifica). El catálogo de stacks de la fábrica hoy no tiene
  un stack de sitio web público en React: el arquitecto propone uno y lo apruebo; no vale
  python-fastapi-next (es para paneles privados) ni node-hono-sqlite (no es React).
- Design system: Astryx (@astryxdesign/core, React 19 + StyleX). Componer con sus componentes y tokens
  (--color-*, --font-*, --spacing-*); nada de HTML suelto ni DS propio. El director de diseño fija la
  paleta sobre los tokens de Astryx siguiendo el método: objetivos → competencia (Repaban, Redesban,
  esmaltadores de Madrid que posicionen) → estructura → plantillas → paleta. Estilo limpio, luminoso,
  de baño reformado; sin plantilla de franquicia.
- Móvil primero; sin scroll horizontal entre 320 y 1440 px; botones táctiles de 44 px; Lighthouse móvil
  >= 90 en las cuatro métricas en portada, página de platos de ducha y FAQ.
- Contenido en ficheros de datos (servicios, FAQ, precios, reseñas, zonas, galería, contacto) editables
  sin tocar componentes. Un README que explique cómo cambiarlos.
- Imágenes: huecos reservados con tamaño definitivo y etiqueta de qué foto va, más
  docs/imagenes-pendientes.md generado. Fotos reales las aportará el cliente después.
- Formulario: nombre, teléfono, tipo de pieza (plato de ducha, bañera, azulejos, otro), daño, foto
  opcional, zona, mensaje. En el MVP envía por email con SMTP normal y guarda la petición en local;
  honeypot y límite por IP; sin captcha.
- WhatsApp con mensaje precargado según la página («Hola, os escribo desde la página de reparación de
  platos de ducha. Os adjunto una foto del daño…»). Teléfono con tel: y horario.
- Reseñas en fichero de datos con AggregateRating; API de Google después del MVP.
- Todo se ejecuta y se prueba en local. Sin servicios de pago. Analítica GA4 opcional lista para pegar
  el ID; banner de cookies solo si hay analítica.

TONO
Castellano, «tú», frases cortas, de oficio y cercano, sin «usted» ni párrafos largos como Repaban.
Honesto: no prometer plazos ni precios que el cliente no confirme; donde falte el dato, texto
provisional marcado como {{PENDIENTE}}.

ALCANCE DEL MVP SUGERIDO (5 funcionalidades)
1. Portada completa con hero, confianza, catálogo, cómo trabajamos, antes/después, precios, reseñas,
   FAQ resumida y formulario.
2. Página principal de reparación de platos de ducha con contenido SEO largo y datos estructurados.
3. Páginas del resto de servicios y «Hoteles y comunidades» generadas desde datos con la misma plantilla.
4. FAQ, Tarifas, Antes y después (galería filtrable), Quiénes somos, Zonas, Contacto y legales.
5. Contacto y conversión: WhatsApp precargado, teléfono, formulario con foto y envío por email.
Después del MVP: páginas por barrio y municipio, panel de administración, reseñas por API, blog con
artículos («¿se puede reparar un plato de ducha de resina?», «esmaltar o cambiar la bañera»),
calculadora orientativa de presupuesto.

2. Lo que el cliente tiene que dar antes de arrancar (o durante el discovery)
Nombre comercial y logo; razón social, NIF y dirección para el aviso legal.
Un único teléfono fijo, un único WhatsApp y un email.
Años de experiencia reales y duración de la garantía (Repaban no la especifica; nosotros sí).
Lista definitiva de servicios y materiales que repara (resina, acrílico, cerámica, piedra, hierro).
Precios «desde» que acepte publicar; si no, «presupuesto gratuito en 24 h».
Zonas reales de trabajo y tiempo de respuesta.
10-20 fotos antes/después en horizontal, por servicio.
Reseñas que ya tenga (Google, Habitissimo) y enlace directo a «escribir reseña».
3-5 referencias de hoteles o comunidades si las hay.

3. Encargos posteriores al MVP
«Genera páginas por distrito y municipio de Madrid con bloques únicos, reutilizando los datos de zonas del producto duchas.»
«Añade un panel de administración con contraseña para ver las peticiones del formulario y editar servicios, precios, reseñas y galería.»
«Trae las reseñas de Google automáticamente (Places API) con caché diaria y recurre al fichero si la API falla.»
«Añade un blog con plantilla SEO y publica 10 artículos sobre reparación y esmaltado de platos de ducha y bañeras.»
«Calculadora orientativa de presupuesto por tipo de pieza y daño que termine en un WhatsApp con el resultado precargado.»
