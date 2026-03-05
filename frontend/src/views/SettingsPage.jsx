import React from 'react';
import {
  Container,
  Title,
  Card,
  Text,
  Group,
  Badge,
  Stack,
} from '@mantine/core';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

function SettingsPage() {
  const { user } = useAuth();

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">
        Settings
      </Title>
      <Stack gap="md">
        <Card shadow="sm" padding="lg" withBorder>
          <Title order={4} mb="md">
            Appearance
          </Title>
          <Group justify="space-between">
            <div>
              <Text size="sm" fw={500}>
                Theme
              </Text>
              <Text size="xs" c="dimmed">
                Toggle between light and dark mode
              </Text>
            </div>
            <ThemeToggle />
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={4} mb="md">
            Notifications
          </Title>
          <Group justify="space-between">
            <div>
              <Text size="sm" fw={500}>
                Email Notifications
              </Text>
              <Text size="xs" c="dimmed">
                Receive email updates about your activity
              </Text>
            </div>
            <Badge variant="light" color="gray" size="sm">
              Coming soon
            </Badge>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" withBorder>
          <Title order={4} mb="md">
            Account
          </Title>
          <Text size="sm" c="dimmed">
            Logged in as <Text span fw={500} c="var(--mantine-color-text)">{user?.email}</Text>
          </Text>
        </Card>
      </Stack>
    </Container>
  );
}

export default SettingsPage;
