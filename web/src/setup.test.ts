import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// vitest corre desde web/: las rutas se resuelven contra el cwd para no depender de import.meta.
const web = process.cwd();
const read = (p: string) => readFileSync(join(web, p), 'utf8');

describe('instalación de Astryx', () => {
  const pkg = JSON.parse(read('package.json')) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  const exact = (v: string | undefined) => typeof v === 'string' && /^\d+\.\d+\.\d+(-[\w.]+)?$/.test(v);

  it('lista los paquetes de Astryx con versión exacta', () => {
    for (const name of ['@astryxdesign/core', '@stylexjs/stylex', '@astryxdesign/theme-neutral', 'next', 'react', 'react-dom']) {
      expect(exact(pkg.dependencies[name]), name).toBe(true);
    }
    expect(exact(pkg.devDependencies['@astryxdesign/cli']), '@astryxdesign/cli').toBe(true);
  });

  it('next.config.ts conserva el export estático y no compila StyleX', () => {
    const cfg = read('next.config.ts');
    expect(cfg).toContain("output: 'export'");
    expect(cfg).toContain('trailingSlash: true');
    expect(cfg).not.toMatch(/^import .*stylex/im);
    for (const f of ['babel.config.js', 'babel.config.cjs', '.babelrc']) expect(existsSync(join(web, f)), f).toBe(false);
  });

  it('globals.css importa reset, astryx y tema precompilados', () => {
    const css = read('src/app/globals.css');
    for (const s of ['@astryxdesign/core/reset.css', '@astryxdesign/core/astryx.css', '@astryxdesign/theme-neutral/theme.css']) {
      expect(css).toContain(s);
    }
  });

  it('web/AGENTS.md existe y no está vacío', () => {
    expect(existsSync(join(web, 'AGENTS.md'))).toBe(true);
    expect(read('AGENTS.md').trim().length).toBeGreaterThan(0);
  });
});

describe('src/lib es puro', () => {
  it('no importa React, Next ni @astryxdesign (lo importa el servidor)', () => {
    const files = readdirSync(join(web, 'src/lib'), { recursive: true, encoding: 'utf8' }).filter((f) => /\.ts$/.test(f));
    for (const f of files) expect(read(join('src/lib', f)), f).not.toMatch(/from\s+['"](react|next|@astryxdesign)/);
  });
});
