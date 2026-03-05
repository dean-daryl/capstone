import React from 'react';
import { Navigate } from 'react-router-dom';
import { Center, Loader, Stack, Title, Text } from '@mantine/core';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Loader color="indigo" size="md" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="xs">
          <Title order={1} c="dimmed">403</Title>
          <Text c="dimmed">You do not have permission to access this page.</Text>
        </Stack>
      </Center>
    );
  }

  return children;
}

export default ProtectedRoute;
