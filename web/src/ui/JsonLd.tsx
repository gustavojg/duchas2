import { jsonLdScript } from '../lib/seo';

/** Datos estructurados de la página: `<script type="application/ld+json">` con el JSON escapado por seo.ts. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }} />;
}
