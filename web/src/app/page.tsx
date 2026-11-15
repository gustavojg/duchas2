import { Card } from '@astryxdesign/core/Card';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { VStack } from '@astryxdesign/core/VStack';
import { APP_NAME } from '../config';

export default function Home() {
  return (
    <VStack gap={4}>
      <Heading level={1}>{APP_NAME}</Heading>
      <Text type="supporting" as="p">Plantilla lista: sustituye esta portada por el producto.</Text>
      <Card>
        <EmptyState
          title="Todavía no hay nada aquí"
          description="La primera entrega de la fábrica dará contenido a esta pantalla."
          headingLevel={2}
        />
      </Card>
    </VStack>
  );
}
