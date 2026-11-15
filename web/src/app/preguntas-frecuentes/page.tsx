import { Heading } from '@astryxdesign/core/Heading';
import { HStack } from '@astryxdesign/core/HStack';
import { Link } from '@astryxdesign/core/Link';
import { VStack } from '@astryxdesign/core/VStack';
import type { Metadata } from 'next';
import { APP_NAME } from '../../config';
import { configFormulario } from '../../lib/config';
import { cargarFaq, cargarNegocio, type Faq, type Negocio } from '../../lib/content';
import { type Modo, modoActual } from '../../lib/dato';
import { preguntasResueltas } from '../../lib/faq';
import { jsonLdFaqPage } from '../../lib/seo';
import { AcordeonFaq } from '../../ui/AcordeonFaq';
import { JsonLd } from '../../ui/JsonLd';

export const metadata: Metadata = {
  title: `Preguntas frecuentes · ${APP_NAME}`,
  description: 'Resolvemos tus dudas sobre la reparación de tu plato de ducha: daños, presupuesto, garantía y tu foto.',
};

export interface PaginaFaqProps {
  faq: Faq;
  negocio: Negocio;
  retencion_dias: number;
  modo: Modo;
}

/**
 * Preguntas frecuentes (brain/design.md: temas como anclas + acordeones). Las respuestas salen resueltas de
 * faq.ts y la misma lista alimenta los desplegables y el JSON-LD FAQPage.
 */
export function PaginaFaq({ faq, negocio, retencion_dias, modo }: PaginaFaqProps) {
  const temas = preguntasResueltas(faq, { negocio, retencion_dias, modo });
  const todas = temas.flatMap((t) => t.preguntas);
  return (
    <VStack gap={6} className="portada">
      <Heading level={1}>Preguntas frecuentes</Heading>
      <HStack gap={3} wrap="wrap" as="ul" aria-label="Temas">
        {temas.map((t) => (
          <HStack as="li" key={t.ancla}>
            <Link href={`#${t.ancla}`}>{t.tema}</Link>
          </HStack>
        ))}
      </HStack>
      {temas.map((t) => (
        <VStack gap={3} as="section" aria-labelledby={t.ancla} key={t.ancla}>
          <Heading level={2} id={t.ancla}>
            {t.tema}
          </Heading>
          <AcordeonFaq preguntas={t.preguntas} idBase={t.ancla} />
        </VStack>
      ))}
      <JsonLd data={jsonLdFaqPage(todas)} />
    </VStack>
  );
}

export default function PreguntasFrecuentes() {
  return (
    <PaginaFaq
      faq={cargarFaq()}
      negocio={cargarNegocio()}
      retencion_dias={configFormulario().retencion_dias}
      modo={modoActual()}
    />
  );
}
