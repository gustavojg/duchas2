# Investigación de mercado: duchas2

Fecha: 2026-11-14. Idea: web comercial en React para una empresa de Madrid que repara y esmalta platos de ducha, bañeras y sanitarios sin obras. La visión (`docs/vision.md`) se trata como decisiones tomadas; esto la completa y la contrasta.

## 1. Resumen ejecutivo

- El mercado de esmaltado en Madrid es pequeño y sus webs son flojas. Repaban (la referencia) lleva copyright 2019, no publica precios, ni horario, ni reseñas, ni plazo de garantía. Los demás tampoco publican tarifas claras.
- **Nadie se posiciona con claridad en "plato de ducha" como servicio principal.** Todos lo citan de pasada dentro de "bañeras". Es el hueco que la visión ya identifica y los datos lo confirman.
- Las referencias de precio vienen de portales de presupuestos (Habitissimo, Cronoshare): esmaltar una bañera cuesta unos 150-400 € (Madrid ≈ 260 €). Cambiar bañera por plato ronda 865-1.200 € en Madrid. Esa diferencia es el argumento de venta, pero son estimaciones de portales que venden leads, no datos independientes.
- Riesgo técnico principal: Astryx es **beta** (junio 2026), y solo documenta guía oficial para Next.js y Vite, no Astro. Eso condiciona la propuesta de stack (sección 8).

## 2. Competidores analizados

### 2.1 Repaban (referencia de contenido) — https://www.repaban.es
- **Qué hace:** restauración y esmaltado de bañeras y sanitarios en Madrid. Dirección: C/ Juan Bravo 3A, 28006.
- **Para quién:** domicilios particulares y hoteles.
- **Precio:** no publica ninguno. Solo "presupuesto sin compromiso".
- **Estructura leída (8 páginas, todas HTTP 200):** Home, Esmaltar bañera (`/esmaltado/`, "Cómo trabajamos"), Servicios (8 servicios), Antes y Después (deslizador, apenas texto), FAQ (7 preguntas), Quiénes somos, Contacto, Blog (no leído).
- **Destaca:** proceso explicado (preparar base, anticorrosión, esmalte; cita la norma UNE 48274:2003 y "2-3 horas"), certificado de garantía en todos los trabajos, 4,5/5 con 42 opiniones en Habitissimo.
- **Critican / debilidades verificadas:**
  - Dos fijos distintos: 911 436 7308 arriba y 911 424 180 abajo (el botón flotante usa el segundo). Además hay un "91 4367308" en un bloque de la home, probable errata.
  - Sin horario, sin precios, sin reseñas en su propia web, sin zonas de servicio.
  - "© 2019 Repaban". Dice "22 años" y "más de 20" en distintos sitios.
  - Garantía sin duración ni condiciones.
  - Facebook enlazado a `#`.
  - Contacto: no se vio formulario en el contenido extraído. No puedo confirmar que no exista (puede ser un embed que el extractor no ve). La visión afirma "sin formulario"; conviene comprobarlo a mano en navegador.
  - Los platos de ducha no son el servicio principal.

### 2.2 Redesban — https://redesban.es
- **Qué hace:** esmaltado completo de bañeras, reparación de golpes y desconchones, esmaltado de platos de carga mineral, restauración de acrílicos y tienda de kits de bricolaje (desde 26,95 €).
- **Para quién:** particulares, constructoras y hoteles de toda España. Directorio de terceros: "más de 13 años", empezó con constructoras y hoteles.
- **Precio:** tarifas de servicio en `/tarifas/` (no leído). Kits desde 26,95 € (otro directorio cita un kit a 59,95 €; datos sin verificar).
- **Destaca:** formulario de presupuesto gratuito con respuesta en menos de 24 h, WhatsApp y teléfono (687 527 173), lista de zonas (Madrid, Móstoles, Alcorcón, Fuenlabrada, Getafe, Leganés). Es el competidor más cercano a lo que queremos hacer.
- **Debilidad:** la ubicación varía según fuente (Móstoles en su web, Fuenlabrada en un directorio). Plato de ducha solo como "platos de carga mineral". No se vieron precios de servicio en portada.

### 2.3 Vilasmalt / arreglarbañeras.com — https://www.arreglarbañeras.com (punycode `xn--arreglarbaeras-znb.com`)
- **Qué hace:** reparación, restauración y esmaltado de bañeras, **platos de ducha**, azulejos y sanitarios. Cambio de color RAL/NCS. Plato de ducha nuevo de 1,5 mm sin obra ("2 horas").
- **Para quién:** servicios técnicos y hoteles de Europa; dice hacer más de mil esmaltados de bañera al año. Sede en Viladecans (Barcelona) según Habitissimo; la web lista centro (Madrid, Guadalajara, Toledo, Segovia, Ávila) entre sus zonas.
- **Precio:** ninguno publicado.
- **Destaca:** cobertura nacional, trabajo solo con personal propio. 4/5 con 21 opiniones en Habitissimo.
- **Debilidad:** no es una empresa local de Madrid, garantía solo como "calidad y durabilidad garantizada" sin plazo, sin WhatsApp visible. Nota: `arreglarbaneras.com` (sin ñ) no resuelve.

### 2.4 Caldisban S.L. — listado en Habitissimo (Madrid)
- Aparece en las búsquedas como esmaltador activo en Madrid, 4,3/5 con 18 opiniones. No pude abrir su ficha ni su web; **dato de segunda mano**, sin precios ni garantía verificados. Se incluye por posicionamiento local, no como análisis completo.

### 2.5 Duchate Madrid — https://www.habitissimo.es/pro/duchate-madrid
- **Qué hace:** sustitución de bañera por plato de ducha en menos de 24 h, sin escombros, con platos antideslizantes de resina o carga mineral.
- **Para quién:** particulares que ya han decidido cambiar. Es el **sustituto directo** de lo que ofrecemos: el cliente que "cree que hay que cambiarlo".
- **Precio:** obra completa de este tipo en Madrid 865-1.200 € (Cronoshare); reforma completa de baño 1.000-3.655 €, media 1.915 € (Habitissimo).
- **Debilidad frente a nosotros:** coste y obra. Eso sostiene el mensaje de la visión.

### 2.6 Portales de captación (competencia por el tráfico, no por el servicio)
- **Habitissimo** (https://www.habitissimo.es/presupuestos/esmaltar-banera) y **Cronoshare** (https://www.cronoshare.com/cuanto-cuesta/esmaltar-banera). Se llevan las búsquedas "esmaltar bañera precio". Son la competencia SEO real, más que las webs de empresa. Cobran comisión o por lead al profesional. Actualizados en 2026.

## 3. Precios de referencia (para la página de Tarifas; el cliente decide cuáles publicar)

| Trabajo | Habitissimo (2026) | Cronoshare (ene 2026) |
|---|---|---|
| Bañera completa (Madrid ≈ 260 €) | media 270 €, rango 200-400 € | 150-300 € |
| Sin brillo | 150 € | 150-200 € |
| Desconchado | 200 € | 80-400 € (desconchones/grietas) |
| Oxidada | 350 € | 180-350 € |
| Con golpe | 400 € | — |
| Cambio de color | 300 € | 200-300 € |
| Desconchón pequeño | ≈ 80 € | — |
| Juntas (baño 4-6 m², vía Repaban en Habitissimo) | 160 € | — |

- Las guías son internamente contradictorias (Habitissimo da media 270 € y también "150-200 €"). Se usan como orden de magnitud.
- Habitissimo dice que en plato de ducha "la técnica es la misma" y no da precio propio. **No encontré precios fiables de reparación de plato de ducha de resina o grietas**, ni una empresa madrileña que se anuncie específicamente para eso. Hay que pedirlos al cliente.
- Factores de precio: mano de obra 20-30 €/h, +20-45 % por reparaciones previas, esmalte cerámico/sintético +20-30 % frente a acrílico. Durabilidad típica del esmalte: 6-10 años (Habitissimo).
- La web no debe prometer cifras ni plazos sin confirmación del cliente (tono de la visión). Todo lo anterior va como `{{PENDIENTE}}` hasta validarlo.

## 4. Funcionalidades

### Must-have (las tienen todos o casi todos)
- Catálogo de servicios con página o bloque propio.
- Teléfono visible y llamada directa.
- Mención de "sin obras" y "en pocas horas".
- Garantía mencionada (casi nadie con plazo).
- Galería antes/después.
- Página de contacto con datos de empresa.
- Mención de trabajo para hoteles (Repaban, Redesban, Vilasmalt).

### Solo algunos
- Formulario de presupuesto con promesa de respuesta en 24 h (Redesban, Vilasmalt tiene "Contáctanos").
- WhatsApp (Redesban; Repaban lo enlaza a 640 892 240).
- Lista de zonas (Redesban, Vilasmalt).
- Explicación del proceso técnico (Repaban `/esmaltado/`).
- Tienda o kits de bricolaje (Redesban).
- Reseñas propias en web: **ninguno**. Solo en portales.
- Precios publicados en web: **ninguno**.

## 5. Oportunidades de diferenciación para un MVP de una persona

1. **Plato de ducha como servicio principal, con SEO propio.** Nadie lo ocupa; una página larga con grieta/golpe/perforación/antideslizante, materiales (resina, acrílico, cerámica, piedra) y FAQPage compite con Habitissimo/Cronoshare en cola larga ("grieta plato de ducha", "plato de ducha resina roto").
2. **Conversión móvil con foto del daño.** WhatsApp precargado por página + formulario con foto + "presupuesto en 24 h". Solo Redesban se acerca, sin foto ni mensaje contextual. Reduce el trabajo de presupuestar y filtra viabilidad antes de llamar.
3. **Transparencia: precios "desde", garantía con plazo escrito, reseñas y un único teléfono.** Los cuatro competidores fallan en esto y los portales lo usan para captar. Una página de Tarifas honesta es el contenido que más busca el usuario ("esmaltar bañera precio").
4. *(Complemento)* **Comparativa honesta reparar vs. cambiar** (resumida, sin las páginas por barrio del producto `duchas`): ancla el precio de 865-1.200 € frente a reparación.

## 6. Palabras clave (ampliación de la lista de la visión)

Las de la visión se mantienen. Propuestas adicionales (**no verificadas con volumen de búsqueda**; no tengo acceso a herramientas de keywords, validarlas con Search Console o Google Keyword Planner gratuito):
- plato de ducha de resina roto, reparar plato de ducha de resina, reparar plato de ducha de carga mineral, plato de ducha agrietado, arreglar plato de ducha, plato de ducha desconchado, plato de ducha amarillento, plato de ducha con óxido, pintar/esmaltar plato de ducha precio, renovar plato de ducha sin obra, cambiar plato de ducha o repararlo, esmaltar plato de ducha de acrílico, plato de ducha perforado, esmaltador bañeras Madrid, esmaltado hoteles Madrid, renovar baños hotel sin cerrar habitaciones, esmaltar bañera color, cuánto cuesta esmaltar una bañera, reparar rajas en bañera de acrílico.

## 7. Riesgos

**Legales**
- LSSI-CE art. 10: aviso legal con razón social, NIF y domicilio. El cliente aún no los ha dado. Sin ellos no se puede publicar.
- RGPD en el formulario: texto de privacidad, base legal, conservación y casilla de aceptación; las fotos de daños en viviendas pueden mostrar datos personales. Hay que guardarlas de forma acotada y definir cuánto tiempo.
- Cookies (LSSI art. 22.2): las cookies técnicas no requieren consentimiento; la analítica sí, según la lectura habitual de la guía AEPD. Fuentes secundarias discrepan sobre si GA4 puede acogerse a la exención de medición de audiencia (no encontré la posición de la AEPD sobre GA4). Para el MVP, sin analítica = sin banner; si se activa GA4, banner con "rechazar" tan fácil como "aceptar". Verificar contra el PDF vigente en aepd.es.
- Publicidad y consumo: las reseñas y "años de experiencia" deben ser reales y verificables. No publicar reseñas inventadas ni cifras sin confirmar. Las reseñas con AggregateRating en el fichero de datos deben coincidir con las que el visitante pueda ver.
- Referencias a Repaban/Redesban: usar solo como análisis interno; no copiar textos ni fotos (ya decidido). No usar sus nombres en metaetiquetas.
- Las quejas de la OCU sobre reparaciones de baño mal hechas (filtración en el canto del plato, masilla irregular) refuerzan la necesidad de garantía por escrito con plazo y condiciones.

**Pagos**
- Ninguno en el MVP (presupuesto y pago fuera de la web). Bien.

**Adopción**
- Las búsquedas de "esmaltar bañera precio" las dominan Habitissimo y Cronoshare; una web nueva tardará meses en posicionar. Conviene ficha de Google Business Profile y reseñas reales desde el principio (no dependen del código).
- Sin fotos reales ni reseñas, la portada pierde la mitad de su argumento. Dependencia crítica del cliente.
- Sin precios publicados el bloque "Tarifas" queda como "presupuesto gratuito en 24 h", es decir, igual que la competencia.

**Técnicos**
- Astryx es beta; las versiones de ejemplo no cuadran entre documentos (0.4.1 y 0.7.10) y no pude fijar la versión actual. Fijar versión exacta en `package.json`.
- Confirmado solo para Next.js y Vite; **Astro no está documentado**. Los componentes de Astryx incluyen `Button`, `Card`, `Stack`, `Heading`, `Text`, `Link` y layouts; no pude confirmar `Accordion`, carrusel/deslizador, campos de formulario ni `Image`. Si faltan, el deslizador antes/después y el FAQ desplegable tendrían que construirse con primitivas, y la visión prohíbe un DS propio y HTML suelto. Comprobar con `npx @astryxdesign/cli component --list` antes de cerrar el diseño.
- El tema neutral nombra Figtree pero no la carga; hay que cargarla (autoalojada, para no depender de Google Fonts y su coste en privacidad/Lighthouse).
- Con Next y Astryx, un `babel.config` propio desactiva SWC y rompe `next/font`; usar la ruta Turbopack/PostCSS documentada o CSS pre-compilado.
- Next con `output: 'export'`: no admite handlers de servidor, ISR ni middleware. El **formulario con SMTP, la subida de foto y el límite por IP necesitan un servidor**, que el export estático no tiene. Hace falta un pequeño servicio aparte (por ejemplo un proceso Node/Hono) o un host que ejecute Next. El sitemap dinámico requiere `export const dynamic = 'force-static'`; un hilo de la comunidad de Vercel (dic 2025) reporta fallos con `output: 'export'`, sin resolución clara en lo que leí. Alternativa más segura: generar `sitemap.xml` y `robots.txt` en un script de build.
- Lighthouse ≥ 90 en móvil con imágenes WebP reales: las fotos del cliente, si son grandes, lo rompen; exigir tamaños y compresión en el pipeline.
- El deslizador antes/después debe ser accesible por teclado y respetar 44 px táctiles.

## 8. Servicios externos

| Necesidad | Opción gratuita | Opción de pago |
|---|---|---|
| Hosting estático del front | GitHub Pages, Cloudflare Pages o Netlify (plan gratuito) | VPS (~4-6 €/mes) o plan de pago de Vercel |
| Backend del formulario (SMTP, foto, límite IP) | Servicio Node/Hono propio ejecutado en local en el MVP | VPS; o servicio de formularios (Formspree, etc.) con plan de pago para adjuntos |
| Email saliente | SMTP "normal" (cuenta del dominio/hosting o Gmail con contraseña de aplicación); Mailpit para pruebas locales | Resend, Postmark, SendGrid |
| WhatsApp | Enlace `wa.me` con texto precargado (gratis, sin API) | WhatsApp Business API (no hace falta) |
| Teléfono | Enlace `tel:` | Centralita virtual |
| SMS | No necesario | Twilio u otros |
| Mapas / zonas | Lista textual + OpenStreetMap/Leaflet si hiciera falta; sin mapa en MVP | Google Maps embebido (cuota de pago por uso) |
| Reseñas | Fichero de datos con AggregateRating (MVP) | Google Places API (después del MVP; tiene cuota de pago por uso) |
| Analítica | Ninguna, o Plausible/Umami autoalojado; GA4 opcional con banner | Plausible Cloud |
| Tipografía | Figtree autoalojada | — |
| Búsqueda de palabras clave | Google Search Console + Keyword Planner (gratuito con cuenta) | Semrush, Ahrefs |
| Dominio | — | ~10-15 €/año (inevitable para producción) |

Todo el MVP corre en local sin pagar, como pide la visión.

## 9. Recomendación de stack (para que el arquitecto decida)

- **Next.js (export estático) + Astryx** es la única combinación con guía oficial. Fortalezas: React 19, SEO estático. Debilidad: el formulario necesita un servicio aparte.
- Astro con islas React encajaría con el SEO y el rendimiento, pero Astryx no documenta Astro, y la combinación con StyleX no está probada. Solo si se hace una prueba de concepto antes.
- Recomiendo: **Next.js con `output: 'export'` para el sitio + un pequeño servicio Node para `/api/contacto`**, con la prueba de que Astryx tiene los componentes necesarios (acordeón, deslizador, campos) antes de aprobar.

## 10. Preguntas abiertas para el cliente (ya listadas en la visión; se añaden las siguientes)

- ¿Qué materiales de plato repara de verdad (resina, carga mineral, acrílico, cerámica, piedra)? La reparación de grietas en resina es técnicamente discutible, así que no hay que prometerla sin confirmarlo.
- ¿Cuántos años de garantía y qué cubre? (Repaban, Vilasmalt y los demás no lo dicen; quien lo diga con claridad gana.)
- ¿Cuál es el tiempo de curado antes de usar la ducha?
- ¿Se aceptan las fotos como parte del presupuesto vinculante o es solo orientativo?
- ¿Cuánto tiempo se conservan las fotos de clientes?

## 11. Limitaciones de esta investigación

- No pude confirmar si Repaban tiene formulario de contacto (extractor sin campos).
- Caldisban y Duchate Madrid se conocen solo por listados; sin precios ni garantías propias.
- No leí la sección `/tarifas/` ni la página de garantías de Redesban.
- Los volúmenes de búsqueda no se midieron.
- Las cifras de precio proceden de portales que venden presupuestos.
- Las fuentes de Astryx incluyen artículos de terceros; la lista de componentes y los tokens `--font-*`/`--color-*` completos no se pudieron verificar.

## Fuentes

- Repaban: https://www.repaban.es , /servicios/ , /preguntas-frecuentes/ , /quienes-somos/ , /esmaltado/ , /antes-y-despues/ , /contacto/
- Habitissimo, ficha Repaban: https://www.habitissimo.es/pro/repaban
- Habitissimo, ficha Vilasmalt: https://www.habitissimo.es/pro/vilasmalt
- Habitissimo, guía de precios: https://www.habitissimo.es/presupuestos/esmaltar-banera
- Habitissimo, Duchate Madrid: https://www.habitissimo.es/pro/duchate-madrid
- Cronoshare, precios: https://www.cronoshare.com/cuanto-cuesta/esmaltar-banera
- Cronoshare, cambio de bañera por plato: https://www.cronoshare.com/servicios/cambiar-banera-plato-ducha/madrid/valdemoro
- Redesban: https://redesban.es/ y https://proveedores.com/proveedores/redesban/
- Vilasmalt / arreglarbañeras: https://www.xn--arreglarbaeras-znb.com/
- OCU, reclamaciones: https://www.ocu.org/reclamar/empresas/repara-tu-ba-C3-B1era/d171a88e0cf58c67fe
- AEPD, nota de prensa de la guía de cookies: https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/la-aepd-presenta-junto-la-industria-una-guia-sobre-el-uso-de
- AEPD, guía de cookies analíticas: https://www.aepd.es/guias/guia-cookies-analiticas-externas.pdf
- Ecija, resumen de la guía de cookies: https://www.ecija.com/actualidad-insights/guia-aepd-uso-cookies/
- Astryx (repositorio): https://github.com/facebook/astryx y https://github.com/meta/astryx/blob/main/packages/core/README.md
- Astryx (build): https://github.com/meta/astryx/blob/main/packages/build/README.md
- Better Stack sobre Astryx: https://betterstack.com/community/guides/ai/astryx-meta-design-system/
- Next.js, metadata: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js, sitemap en export estático (blog): https://keninkujovic-com.pages.dev/blog/nextjs-static-sitemap
- Vercel Community, error de sitemap con `output: 'export'`: https://community.vercel.com/t/deployment-blocked-by-export-const-dynamic-error-on-sitemap-xml-with-output-export/30314.md
