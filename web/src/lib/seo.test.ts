import { describe, expect, it } from 'vitest';
import { metadataPagina, robotsMeta } from './seo.js';

// Lo ejecuta el vitest de la raíz (lógica pura de web/src/lib).
const base = { titulo: 'Privacidad', descripcion: 'Cómo tratamos tus datos.', baseUrl: 'https://x.test/', nombreSitio: 'Duchas 2' };

describe('seo', () => {
  it('canonical y Open Graph absolutos y coherentes con title y description', () => {
    const m = metadataPagina({ ...base, ruta: '/privacidad/' });
    expect(m.title).toBe('Privacidad · Duchas 2');
    expect(m.description).toBe('Cómo tratamos tus datos.');
    expect(m.alternates.canonical).toBe('https://x.test/privacidad/');
    expect(m.openGraph.url).toBe('https://x.test/privacidad/');
    expect(m.openGraph.title).toBe(m.title);
    expect(m.openGraph.description).toBe(m.description);
    expect(m.openGraph.siteName).toBe('Duchas 2');
    expect(m.openGraph.locale).toBe('es_ES');
    expect(m.openGraph.type).toBe('website');
  });

  it('dos rutas distintas dan canonicals distintos', () => {
    const a = metadataPagina({ ...base, ruta: '/privacidad/' });
    const b = metadataPagina({ ...base, ruta: '/cookies/' });
    expect(a.alternates.canonical).not.toBe(b.alternates.canonical);
  });

  it('robots según el modo borrador', () => {
    expect(robotsMeta(true)).toEqual({ index: false, follow: false });
    expect(robotsMeta(false)).toEqual({ index: true, follow: true });
  });
});
