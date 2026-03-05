import React, { useState } from 'react';
import {
  Text,
  UnstyledButton,
  Group,
  Paper,
  Stack,
  Collapse,
  ScrollArea,
  Center,
} from '@mantine/core';
import { IconMessageCircle, IconChevronDown, IconChevronRight } from '@tabler/icons-react';

interface QueryHistoryItem {
  id: string;
  text: string;
  response: string;
  source: string;
  createdAt: string;
}

interface ChatHistoryProps {
  history: QueryHistoryItem[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ history }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <Center py="md">
        <Text size="sm" c="dimmed">
          No previous queries
        </Text>
      </Center>
    );
  }

  return (
    <ScrollArea mah={250} scrollbarSize={6}>
      <Stack gap={4}>
        {history.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <Paper key={item.id} withBorder radius="md">
              <UnstyledButton
                w="100%"
                px="sm"
                py="xs"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <Group gap="xs" wrap="nowrap">
                  <IconMessageCircle
                    size={14}
                    color="var(--mantine-color-indigo-6)"
                    style={{ flexShrink: 0 }}
                  />
                  <Text size="xs" truncate flex={1}>
                    {item.text}
                  </Text>
                  {isExpanded ? (
                    <IconChevronDown size={14} color="var(--mantine-color-gray-5)" />
                  ) : (
                    <IconChevronRight size={14} color="var(--mantine-color-gray-5)" />
                  )}
                </Group>
              </UnstyledButton>
              <Collapse in={isExpanded}>
                <Paper
                  px="sm"
                  pb="xs"
                  bg="var(--mantine-color-gray-0)"
                  style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
                >
                  <Text size="xs" c="dimmed" pt="xs" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {item.response}
                  </Text>
                  <Text size="xs" c="dimmed" mt={4} opacity={0.6}>
                    {new Date(item.createdAt).toLocaleDateString()} via {item.source}
                  </Text>
                </Paper>
              </Collapse>
            </Paper>
          );
        })}
      </Stack>
    </ScrollArea>
  );
};
