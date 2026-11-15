/**
 * IP del cliente para el límite de envíos. Solo con TRUST_PROXY=1 (detrás de un proxy de confianza) se mira el
 * primer elemento de X-Forwarded-For; sin él la cabecera se ignora, porque cualquiera puede falsificarla.
 */
export function resolverIp(remote: string | undefined, forwardedFor: string | null, trustProxy: boolean): string {
  if (trustProxy && forwardedFor) {
    const primera = forwardedFor.split(',')[0]?.trim();
    if (primera) return primera;
  }
  return remote || 'desconocida';
}
