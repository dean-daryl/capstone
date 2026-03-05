import React, { useState } from 'react';
import {
  Container,
  Card,
  Title,
  TextInput,
  Button,
  Group,
  Avatar,
  Text,
  Badge,
  Stack,
} from '@mantine/core';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: API call to update profile
  };

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">
        Profile
      </Title>
      <Card shadow="sm" padding="lg" withBorder>
        <Group mb="lg">
          <Avatar size="lg" radius="xl" color="indigo" variant="light">
            {user?.firstName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <div>
            <Text fw={600} size="lg">
              {user?.firstName} {user?.lastName}
            </Text>
            <Text size="sm" c="dimmed">
              {user?.email}
            </Text>
            <Badge mt={4} color="indigo" variant="light" size="sm">
              {user?.role}
            </Badge>
          </div>
        </Group>

        <form onSubmit={handleSave}>
          <Stack gap="sm">
            <TextInput
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextInput
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <TextInput
              label="Email"
              value={user?.email || ''}
              disabled
            />
            <Button type="submit" mt="xs">
              Save Changes
            </Button>
          </Stack>
        </form>
      </Card>
    </Container>
  );
}

export default ProfilePage;
