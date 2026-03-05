import { Group, Text } from '@mantine/core';
import { IconRobot } from '@tabler/icons-react';

export const Header = () => {
  return (
    <Group gap="xs">
      <IconRobot size={28} color="var(--mantine-color-indigo-6)" />
      <Text
        size="lg"
        fw={700}
        variant="gradient"
        gradient={{ from: 'indigo', to: 'violet', deg: 135 }}
      >
        SomaTek AI
      </Text>
    </Group>
  );
};
