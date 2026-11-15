import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';

/** Se exporta como web/out/404.html, que Hono devuelve con estado 404 para cualquier ruta desconocida. */
export default function NotFound() {
  return (
    <EmptyState
      title="No encontramos esta página"
      description="Puede que la dirección esté mal escrita o que la página ya no exista."
      headingLevel={1}
      actions={<Button variant="primary" label="Ir a la portada" href="/" />}
    />
  );
}
