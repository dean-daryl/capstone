import { Link, useLocation } from 'react-router-dom';
import {
  AppShell,
  Group,
  Text,
  UnstyledButton,
  Stack,
  Divider,
  Avatar,
  Box,
  ActionIcon,
  ScrollArea,
} from '@mantine/core';
import {
  IconRobot,
  IconX,
  IconLayoutSidebarLeftExpand,
  IconLogout,
} from '@tabler/icons-react';
import RecentActivities from './recent-activity/RecentActivities.jsx';
import menuConfig from '../config/menuConfig.js';
import { useAuth } from '../context/AuthContext.jsx';

function SideBar({ opened, setOpened }) {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const menuItems = menuConfig[role] || menuConfig.STUDENT;

  return (
    <>
      <AppShell.Navbar p="sm" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Group justify="space-between" mb="sm">
          <UnstyledButton component={Link} to="/dashboard">
            <Group gap="xs">
              <IconRobot size={26} color="var(--mantine-color-indigo-5)" />
              <Text fw={700} size="lg">SomaTek AI</Text>
            </Group>
          </UnstyledButton>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => setOpened(false)}
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>

        <Divider mb="sm" />

        {/* Navigation */}
        <ScrollArea style={{ flex: 1 }} scrollbarSize={6}>
          <Stack gap={2}>
            {menuItems.map((item, index) => {
              if (item.type === 'recent-activities') {
                return (
                  <Box key="recent-activities" mt="lg" mb="xs">
                    <Text
                      size="xs"
                      fw={600}
                      tt="uppercase"
                      c="dimmed"
                      px="sm"
                      mb="xs"
                    >
                      Recent Activity
                    </Text>
                    <RecentActivities />
                  </Box>
                );
              }
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <UnstyledButton
                  key={index}
                  component={Link}
                  to={item.path}
                  px="sm"
                  py={8}
                  style={(theme) => ({
                    borderRadius: theme.radius.md,
                    backgroundColor: isActive
                      ? 'var(--mantine-color-indigo-0)'
                      : 'transparent',
                    color: isActive
                      ? 'var(--mantine-color-indigo-7)'
                      : 'var(--mantine-color-gray-7)',
                    '&:hover': {
                      backgroundColor: isActive
                        ? 'var(--mantine-color-indigo-0)'
                        : 'var(--mantine-color-gray-0)',
                    },
                  })}
                >
                  <Group gap="sm">
                    <Icon
                      size={18}
                      style={{
                        color: isActive
                          ? 'var(--mantine-color-indigo-6)'
                          : 'var(--mantine-color-gray-5)',
                      }}
                    />
                    <Text size="sm" fw={isActive ? 600 : 500}>
                      {item.label}
                    </Text>
                  </Group>
                </UnstyledButton>
              );
            })}
          </Stack>
        </ScrollArea>

        {/* User footer */}
        <Divider mt="sm" mb="sm" />
        <Group justify="space-between">
          <Group gap="sm">
            <Avatar
              size="sm"
              radius="xl"
              color="indigo"
              variant="light"
            >
              {displayName ? displayName[0].toUpperCase() : 'U'}
            </Avatar>
            <div>
              <Text size="sm" fw={500} lh={1.2}>
                {displayName}
              </Text>
              <Text size="xs" c="dimmed">
                {role}
              </Text>
            </div>
          </Group>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={logout}
            title="Logout"
          >
            <IconLogout size={18} />
          </ActionIcon>
        </Group>
      </AppShell.Navbar>

      {!opened && (
        <ActionIcon
          variant="light"
          color="gray"
          size="lg"
          onClick={() => setOpened(true)}
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 100,
          }}
        >
          <IconLayoutSidebarLeftExpand size={20} />
        </ActionIcon>
      )}
    </>
  );
}

export default SideBar;
