import React from 'react';
import { Link } from 'react-router-dom';
import { Group, Text, UnstyledButton } from '@mantine/core';
import { IconMessage, IconPhoto, IconPlayerPlay } from '@tabler/icons-react';

const iconByType = {
  TEXT: IconMessage,
  IMAGE: IconPhoto,
  VIDEO: IconPlayerPlay,
};

function RecentActivityItem({ activity }) {
  const truncatedTitle =
    activity.title.replace(/^"|"$/g, '').slice(0, 26) +
    (activity.title.length > 30 ? '...' : '');

  const Icon = iconByType[activity.conversationType] || IconMessage;

  return (
    <UnstyledButton
      component={Link}
      to={`/dashboard/activity/${activity.id}`}
      px="sm"
      py={6}
      style={(theme) => ({
        borderRadius: theme.radius.md,
        '&:hover': {
          backgroundColor: 'var(--mantine-color-gray-0)',
        },
      })}
    >
      <Group gap="sm">
        <Icon size={15} color="var(--mantine-color-gray-5)" />
        <Text size="sm" c="dimmed" truncate>
          {truncatedTitle}
        </Text>
      </Group>
    </UnstyledButton>
  );
}

export default RecentActivityItem;
