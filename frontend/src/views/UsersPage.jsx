import React, { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Card,
  Table,
  Badge,
  Group,
  Text,
  Center,
  Loader,
} from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import apiClient from '../api/apiClient';

const roleBadgeColor = {
  ADMIN: 'red',
  TEACHER: 'blue',
  STUDENT: 'green',
};

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/users')
      .then((res) => {
        if (res.data?.data) {
          setUsers(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container fluid p="lg">
      <Group gap="sm" mb="lg">
        <IconUsers size={24} color="var(--mantine-color-indigo-6)" />
        <Title order={2}>User Management</Title>
      </Group>

      <Card shadow="sm" padding={0} withBorder>
        {loading ? (
          <Center py="xl">
            <Loader color="indigo" />
          </Center>
        ) : users.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed">No users found.</Text>
          </Center>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {u.firstName} {u.lastName}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {u.email}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={roleBadgeColor[u.role] || 'gray'}
                      variant="light"
                      size="sm"
                    >
                      {u.role}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
}

export default UsersPage;
