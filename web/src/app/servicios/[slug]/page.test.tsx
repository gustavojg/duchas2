import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargarNegocio, cargarServicios, type Servicio } from '../../../lib/content';
import PaginaServicio, { dynamicParams, generateMetadata, generateStaticParams, metadataServicio, paramsServicios } from './page';

const servicios = cargarServicios();
const urlBase = cargarNegocio().url_base;
const base = urlBase.replace(/\/+$/, '');
const deTipoServicio = servicios.filter((s) => s.tipo === 'servicio');

describe('/servicios/[slug]/', () => {
  it('paramsServicios da un slug por cada servicio de tipo servicio (8) y ninguno principal ni de empresas', () => {
    const params = paramsServicios(servicios);
    expect(params).toHaveLength(8);
    expect(params).toEqual(deTipoServicio.map((s) => ({ slug: s.slug })));
    const slugs = params.map((p) => p.slug);
    for (const s of servicios.filter((x) => x.tipo !== 'servicio')) expect(slugs).not.toContain(s.slug);
  });

  it('un servicio nuevo en el fixture trae su slug sin tocar código', () => {
    const nuevo: Servicio = { ...deTipoServicio[0], slug: 'nuevo-servicio', ruta: '/servicios/nuevo-servicio/', orden: 99 };
    expect(paramsServicios([...servicios, nuevo]).map((p) => p.slug)).toContain('nuevo-servicio');
  });

  it('generateStaticParams usa servicios.json y dynamicParams es false', async () => {
    expect(dynamicParams).toBe(false);
    expect(await generateStaticParams()).toEqual(paramsServicios(servicios));
  });

  it('metadataServicio da title y description del servicio y canonical = url_base + ruta', () => {
    const s = deTipoServicio[0];
    const meta = metadataServicio(servicios, s.slug, urlBase);
    expect(meta.title).toBe(s.seo.title);
    expect(meta.description).toBe(s.seo.description);
    expect(meta.alternates.canonical).toBe(`${base}${s.ruta}`);
  });

  it('title, description y canonical son únicos entre todos los servicios del JSON real', () => {
    const metas = servicios.map((s) => metadataServicio(servicios, s.slug, urlBase));
    for (const campo of [(m: (typeof metas)[number]) => m.title, (m: (typeof metas)[number]) => m.description, (m: (typeof metas)[number]) => m.alternates.canonical]) {
      expect(new Set(metas.map(campo)).size).toBe(servicios.length);
    }
  });

  it('un slug inexistente lanza', () => {
    expect(() => metadataServicio(servicios, 'no-existe', urlBase)).toThrow(/no-existe/);
  });

  it('generateMetadata acepta params como Promise', async () => {
    const s = deTipoServicio[1];
    const meta = await generateMetadata({ params: Promise.resolve({ slug: s.slug }) });
    expect(meta.title).toBe(s.seo.title);
  });

  it('la página pinta la plantilla del servicio', async () => {
    const s = deTipoServicio[2];
    const html = renderToStaticMarkup(await PaginaServicio({ params: Promise.resolve({ slug: s.slug }) }));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain(`${s.nombre} en Madrid`);
  });

  it('con un slug inexistente la página llama a notFound()', async () => {
    await expect(PaginaServicio({ params: Promise.resolve({ slug: 'no-existe' }) })).rejects.toThrow();
  });
});
