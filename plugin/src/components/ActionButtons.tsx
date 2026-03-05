import React from 'react';
import { Button, Group } from '@mantine/core';
import { IconLanguage, IconSparkles } from '@tabler/icons-react';

interface ActionButtonsProps {
  onTranslate: () => void;
  onSimplify: () => void;
  isTranslating: boolean;
  isSimplifying: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onTranslate,
  onSimplify,
  isTranslating,
  isSimplifying,
}) => {
  return (
    <Group gap="xs">
      <Button
        variant="light"
        color="indigo"
        size="xs"
        onClick={onTranslate}
        loading={isTranslating}
        leftSection={!isTranslating && <IconLanguage size={14} />}
      >
        Translate to Kinyarwanda
      </Button>
      <Button
        variant="light"
        color="blue"
        size="xs"
        onClick={onSimplify}
        loading={isSimplifying}
        leftSection={!isSimplifying && <IconSparkles size={14} />}
      >
        Simplify
      </Button>
    </Group>
  );
};
