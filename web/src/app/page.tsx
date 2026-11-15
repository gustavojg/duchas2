import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { DESCRIPTION, TAGLINE } from '../lib/site';
import { PlatoPartido } from '../ui/art';

/**
 * Portada provisional del bootstrap: nombre, frase y la ilustración del hero. La portada completa
 * (CTA de WhatsApp y Llamar, franja de confianza, antes/después…) es la funcionalidad F1, tras D0.
 */
export default function Home() {
  return (
    <VStack gap={4}>
      <Text type="label" color="accent" as="p">
        Madrid · Platos de ducha, bañeras y azulejos
      </Text>
      <Heading level={1}>{TAGLINE}</Heading>
      <Text type="large" as="p">
        {DESCRIPTION}
      </Text>
      <Card>
        <PlatoPartido />
      </Card>
    </VStack>
  );
}
