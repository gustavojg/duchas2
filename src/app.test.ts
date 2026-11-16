import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';
import { testApp } from './testing.js';
import { APP_NAME } from '../web/src/lib/site.js';

describe('testApp()', () => {
  it('crea un dataDir temporal y un reloj que avanza', () => {
    const { deps, dataDir, clock } = testApp();
    expect(fs.statSync(dataDir).isDirectory()).toBe(true);
    expect(deps.dataDir).toBe(dataDir);
    const antes = deps.now().getTime();
    clock.advance(61);
    expect(deps.now().getTime() - antes).toBe(61 * 60000);
  });

  it('trae la configuración del formulario y se puede sobrescribir', () => {
    const { deps } = testApp({ emailDestino: null });
    expect(deps.formulario).toEqual({ retencion_dias: 90, foto_max_mb: 10, limite_envios: 5, ventana_min: 60 });
    expect(deps.ipSalt).toBe('sal-de-test');
    expect(deps.emailDestino).toBeNull();
    expect(testApp().deps.emailDestino).toBe('taller@ejemplo.test');
  });
});


/** web/out de mentira: el de verdad lo prueba `pnpm test:build` (tests/build/). */
function fakeWeb() {
  const { app, webDir } = testApp();
  fs.writeFileSync(path.join(webDir, 'index.html'), '<html><body>portada</body></html>');
  fs.writeFileSync(path.join(webDir, '404.html'), '<html><body>no encontrada</body></html>');
  fs.mkdirSync(path.join(webDir, 'contacto'));
  fs.writeFileSync(path.join(webDir, 'contacto', 'index.html'), '<html><body>contacto</body></html>');
  fs.mkdirSync(path.join(webDir, '_next', 'static'), { recursive: true });
  fs.writeFileSync(path.join(webDir, '_next', 'static', 'a1b2.js'), 'console.log(1)');
  return app;
}

describe('app', () => {
  const app = fakeWeb();

  it('responde /health', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  it('/health informa del commit servido', async () => {
    const res = await testApp({ commit: 'abc1234' }).app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, app: APP_NAME, commit: 'abc1234' });
  });

  it('/health devuelve commit «desconocido» si falta GIT_SHA', async () => {
    const { commit } = loadConfig({});
    const res = await testApp({ commit }).app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect('commit' in body).toBe(true);
    expect(body).toEqual({ ok: true, app: APP_NAME, commit: 'desconocido' });
  });

  it('sirve la portada estática en /', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(await res.text()).toContain('portada');
  });

  it('redirige a la barra final y sirve el index.html del directorio', async () => {
    const res = await app.request('/contacto?x=1');
    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('/contacto/?x=1');
    expect(await (await app.request('/contacto/')).text()).toContain('contacto');
  });

  it('da caché immutable a /_next/static', async () => {
    const res = await app.request('/_next/static/a1b2.js');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('immutable');
    expect((await app.request('/')).headers.get('cache-control') ?? '').not.toContain('immutable');
  });

  it('responde 404 con 404.html a lo desconocido y JSON en /api', async () => {
    const res = await app.request('/no-existe');
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('no encontrada');
    const api = await app.request('/api/nada');
    expect(api.status).toBe(404);
    expect(await api.json()).toEqual({ error: 'not_found' });
  });
});
