import { defineConfig } from 'vitest/config';

/** Suite rápida de la raíz: servidor (app.request()) y lógica pura de web/src/lib. Los componentes los prueba web/. */
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'web/src/lib/**/*.test.ts'],
  },
});
