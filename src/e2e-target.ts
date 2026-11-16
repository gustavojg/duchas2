/** Destino de las pruebas e2e: un staging ya levantado (E2E_BASE_URL) o el `pnpm start` local que lanza Playwright. */
export interface E2eTarget {
  baseURL: string;
  usaServidorLocal: boolean;
}

export function e2eTarget(env: Record<string, string | undefined>): E2eTarget {
  const remota = env.E2E_BASE_URL;
  if (remota) {
    let url: URL;
    try {
      url = new URL(remota);
    } catch {
      throw new Error(`E2E_BASE_URL no es una URL válida: "${remota}" (ejemplo: http://127.0.0.1:8804)`);
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error(`E2E_BASE_URL debe ser http(s), no "${url.protocol}": "${remota}"`);
    }
    return { baseURL: remota.replace(/\/+$/, ''), usaServidorLocal: false };
  }
  return { baseURL: `http://127.0.0.1:${env.E2E_PORT ?? 3100}`, usaServidorLocal: true };
}
