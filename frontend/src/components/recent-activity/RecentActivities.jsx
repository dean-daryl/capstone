import React, { useEffect, useState } from 'react';
import { Stack, Group, Text } from '@mantine/core';
import {
  IconClock,
  IconCalendar,
  IconCalendarEvent,
  IconHistory,
} from '@tabler/icons-react';
import { getRecentActivity } from '../../api/recentActivityService';
import { getDateRange } from '../../utils/dateUtils';
import RecentActivityItem from './RecentActivityItem';
import { useAuth } from '../../context/AuthContext';

const iconMap = {
  today: IconClock,
  yesterday: IconCalendar,
  last7Days: IconCalendarEvent,
  last30Days: IconHistory,
};

function RecentActivities() {
  const { user } = useAuth();
  const [sections, setSections] = useState([
    { title: 'Today', data: [], dateRange: 'today' },
    { title: 'Yesterday', data: [], dateRange: 'yesterday' },
    { title: 'Last 7 days', data: [], dateRange: 'last7Days' },
    { title: 'Last 30 days', data: [], dateRange: 'last30Days' },
  ]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchActivities = async () => {
      const updatedSections = await Promise.all(
        sections.map(async (section) => {
          const { startDate, endDate } = getDateRange(section.dateRange);
          const activities = await getRecentActivity(user.id, startDate, endDate, 1, 10);
          return { ...section, data: activities.content || [] };
        })
      );
      setSections(updatedSections);
    };

    fetchActivities();
  }, [user?.id]);

  return (
    <Stack gap="md">
      {sections.map(
        (section, index) =>
          section.data.length > 0 && (
            <div key={index}>
              <Group gap="xs" px="sm" mb={4}>
                {React.createElement(iconMap[section.dateRange] || IconClock, {
                  size: 14,
                  color: 'var(--mantine-color-gray-5)',
                })}
                <Text size="xs" fw={500} c="dimmed">
                  {section.title}
                </Text>
              </Group>
              <Stack gap={2}>
                {section.data.map((activity, idx) => (
                  <RecentActivityItem key={idx} activity={activity} />
                ))}
              </Stack>
            </div>
          )
      )}
    </Stack>
  );
}

export default RecentActivities;
