import { configDefaults, defineConfig } from 'vitest/config';

/** Tests de componentes (renderToStaticMarkup, sin navegador). La lógica pura de src/lib la prueba el vitest de la raíz. */
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'src/lib/**', 'out/**', '.next/**'],
  },
});
