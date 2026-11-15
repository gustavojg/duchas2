# 0003 — Formulario: Hono + SQLite + fotos en disco + SMTP con nodemailer

Estado: aceptada · 2026-11-14

## Contexto

F5 pide: formulario con una foto opcional (JPEG/PNG/WebP/HEIC, ≤ 10 MB), email a la empresa con la foto
(Mailpit en local, SMTP configurable), petición guardada en local, honeypot, 5 envíos/IP/60 min, códigos
HTTP concretos (201/400/413/415/429/5xx) y borrado automático a los N días. Sin servicios de pago.

## Decisión

- `POST /api/contacto` en el mismo proceso Hono que sirve el sitio. Orden: límite de cuerpo (413) →
  límite por IP (429) → honeypot (201 falso) → validación zod compartida con el cliente (400 con campo)
  → tipo de foto por **bytes mágicos** (415) → guardar → enviar email.
- Peticiones en SQLite (`node:sqlite`, tabla `peticiones`), fotos en `DATA_DIR/fotos/` (nunca servidas).
- Límite por IP persistente en SQLite (`envios_ip`), IP guardada como HMAC con `IP_SALT`. Cuenta todos
  los intentos que llegan al handler.
- Email con `nodemailer`: transporte `smtp` (por defecto `127.0.0.1:1025` = Mailpit) o `file` (escribe
  `.eml`, para E2E). La app recibe un `Mailer` inyectado; los tests usan uno falso.
- Si el email falla se deshace el guardado (fila y foto) y se responde **503**: el usuario ve teléfono
  y WhatsApp y conserva lo que escribió; no quedan peticiones que la empresa no recibió.
- Reloj e IP inyectables en `createApp` para probar ventanas y caducidad sin esperar.

## Alternativas descartadas

- **Formspree u otros SaaS de formularios**: adjuntos solo en planes de pago; datos fuera.
- **Límite en memoria**: se pierde al reiniciar y no se puede limpiar igual que el resto.
- **Guardar aunque falle el email y reintentar más tarde**: necesita cola y reintentos; el PRD pide que
  el usuario vea un error si el envío falla.
- **Confiar en `Content-Type` del archivo**: lo controla el cliente; los bytes mágicos no.

## Consecuencias

- Un único `DATA_DIR` que respaldar; el borrado de RGPD es un `DELETE` + `unlink`.
- Detrás de un proxy habrá que activar `TRUST_PROXY=1` para que el límite use la IP real.
- HEIC se acepta sin convertir (solo adjunto), sin dependencias nativas en el servidor.
