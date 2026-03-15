import {
  IconLayoutDashboard,
  IconMessageCircle,
  IconUsers,
  IconBook,
  IconUserCircle,
  IconSettings,
} from '@tabler/icons-react';

const menuConfig = {
  STUDENT: [
    { label: 'Dashboard', icon: IconLayoutDashboard, path: '/dashboard' },
    { label: 'Ask AI', icon: IconMessageCircle, path: '/dashboard/query' },
    { type: 'recent-activities' },
    { label: 'Profile', icon: IconUserCircle, path: '/dashboard/profile' },
    { label: 'Settings', icon: IconSettings, path: '/dashboard/settings' },
  ],
  TEACHER: [
    { label: 'Dashboard', icon: IconLayoutDashboard, path: '/dashboard' },
    { label: 'Ask AI', icon: IconMessageCircle, path: '/dashboard/query' },
    { label: 'Courses', icon: IconBook, path: '/dashboard/courses' },
    { label: 'Users', icon: IconUsers, path: '/dashboard/users' },
    { label: 'Profile', icon: IconUserCircle, path: '/dashboard/profile' },
    { label: 'Settings', icon: IconSettings, path: '/dashboard/settings' },
  ],
  ADMIN: [
    { label: 'Dashboard', icon: IconLayoutDashboard, path: '/dashboard' },
    { label: 'Ask AI', icon: IconMessageCircle, path: '/dashboard/query' },
    { label: 'Courses', icon: IconBook, path: '/dashboard/courses' },
    { label: 'Users', icon: IconUsers, path: '/dashboard/users' },
    { label: 'Settings', icon: IconSettings, path: '/dashboard/settings' },
  ],
};

export default menuConfig;
