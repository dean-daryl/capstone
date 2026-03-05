import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Group,
  Title,
  Text,
  Button,
  Paper,
  Stack,
  Avatar,
  Box,
} from '@mantine/core';
import { IconRobot, IconArrowLeft } from '@tabler/icons-react';
import { getRecentActivityById } from '../../api/recentActivityService';

function ActivityDetails() {
  const { id } = useParams();
  const [conversationData, setConversationData] = useState(null);

  useEffect(() => {
    const fetchConversationData = async () => {
      if (id) {
        const response = await getRecentActivityById(id);
        setConversationData(response);
      }
    };
    fetchConversationData();
  }, [id]);

  const renderContent = (conversationData, key, value) => {
    if (key.includes('prompt') && value.includes('<iframe')) {
      return (
        <Box maw={800} mx="auto">
          <div
            style={{ borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        </Box>
      );
    }

    if (conversationData.conversationType === 'IMAGE' && key.includes('prompt')) {
      return (
        <Box maw={600} mx="auto">
          <img
            src={value}
            alt="Generated content"
            style={{
              borderRadius: 'var(--mantine-radius-md)',
              width: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
      );
    }

    const isUserMessage = key.includes('prompt');
    return (
      <Box maw={800} mx="auto">
        <Group
          justify={isUserMessage ? 'flex-end' : 'flex-start'}
          align="flex-start"
          gap="sm"
        >
          {!isUserMessage && (
            <Avatar size="sm" radius="xl" color="indigo" variant="light">
              <IconRobot size={16} />
            </Avatar>
          )}
          <Paper
            p="sm"
            radius="md"
            maw="70%"
            bg={
              isUserMessage
                ? 'var(--mantine-color-indigo-6)'
                : 'var(--mantine-color-gray-0)'
            }
            c={isUserMessage ? 'white' : undefined}
            shadow={isUserMessage ? undefined : 'xs'}
          >
            <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
              {value}
            </Text>
          </Paper>
        </Group>
      </Box>
    );
  };

  return (
    <Box>
      <Box
        py="sm"
        px="md"
        style={{
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'var(--mantine-color-body)',
        }}
      >
        <Group justify="space-between">
          <Button
            component={Link}
            to="/dashboard"
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Dashboard
          </Button>
          <Group gap="xs">
            <IconRobot size={20} color="var(--mantine-color-indigo-6)" />
            <Title order={4}>Conversation Details</Title>
          </Group>
        </Group>
      </Box>

      <Container size="lg" py="xl">
        <Stack gap="lg">
          {conversationData &&
            Object.entries(conversationData.conversation).map(([key, value], index) => (
              <div key={index}>{renderContent(conversationData, key, value)}</div>
            ))}
        </Stack>
      </Container>
    </Box>
  );
}

export default ActivityDetails;
