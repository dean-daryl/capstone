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
  Switch,
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
  const [togglingId, setTogglingId] = useState(null);

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

  const handleToggleStatus = async (userId) => {
    setTogglingId(userId);
    try {
      const res = await apiClient.patch(`/users/${userId}/status`);
      if (res.data?.data) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, active: res.data.data.active } : u))
        );
      }
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <Container fluid p="lg">
      <Group gap="sm" mb="lg">
        <IconUsers size={24} color="var(--mantine-color-indigo-6)" />
        <Title order={2}>User Management</Title>
        {!loading && (
          <Badge variant="light" color="gray" size="lg">
            {users.length} users
          </Badge>
        )}
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
                <Table.Th>First Name</Table.Th>
                <Table.Th>Last Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((u) => (
                <Table.Tr key={u.id} style={{ opacity: u.active === false ? 0.6 : 1 }}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {u.firstName}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {u.lastName}
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
                  <Table.Td>
                    <Switch
                      checked={u.active !== false}
                      onChange={() => handleToggleStatus(u.id)}
                      disabled={togglingId === u.id}
                      color="green"
                      size="sm"
                      label={u.active !== false ? 'Active' : 'Inactive'}
                    />
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
