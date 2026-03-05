import React, { useState, useEffect } from 'react';
import {
  Container,
  SimpleGrid,
  Card,
  Text,
  Title,
  Group,
  ThemeIcon,
  Skeleton,
  Stack,
} from '@mantine/core';
import {
  IconRobot,
  IconFileText,
  IconMessageCircle,
  IconStar,
  IconTag,
} from '@tabler/icons-react';
import { fetchAnalyticsData } from '../api/analyticsService';
import { fetchOverviewStats } from '../api/statsService';
import useFetch from '../api/useFetch';
import AnalyticsReChart from './charts/AnalyticsRechart';
import { getDateRange } from '../utils/dateUtils';
import ThemeToggle from '../components/ThemeToggle';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card shadow="sm" padding="lg" withBorder>
    <Group justify="space-between" align="flex-start">
      <div>
        <Text size="sm" c="dimmed" fw={500}>
          {title}
        </Text>
        <Title order={2} mt="xs">
          {value}
        </Title>
      </div>
      <ThemeIcon size={44} radius="md" variant="light" color={color || 'indigo'}>
        <Icon size={22} />
      </ThemeIcon>
    </Group>
  </Card>
);

const Home = () => {
  const ranges = ['today', 'lastWeek', 'thisMonth', 'thisQuarter'];
  const firstname = localStorage.getItem('firstName') ?? '';

  const [overviewStats, setOverviewStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetchOverviewStats();
        setOverviewStats(response.data);
      } catch (err) {
        console.error('Failed to fetch overview stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const fetchDataForRange = (range) => {
    const { startDate, endDate } = getDateRange(range);
    return useFetch(() => fetchAnalyticsData(startDate, endDate));
  };

  const results = ranges.map((range) => fetchDataForRange(range));
  const loading = results.some((result) => result.loading) || statsLoading;

  if (loading) {
    return (
      <Container fluid p="lg">
        <Stack gap="lg">
          <Group justify="space-between">
            <Skeleton height={30} width={200} />
            <Skeleton height={36} width={120} />
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={120} radius="md" />
            ))}
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            {[1, 2].map((i) => (
              <Skeleton key={i} height={400} radius="md" />
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    );
  }

  const stats = [
    { title: 'Total Documents', value: overviewStats?.totalDocuments ?? '-', icon: IconFileText, color: 'blue' },
    { title: 'Total Queries', value: overviewStats?.totalQueries ?? '-', icon: IconMessageCircle, color: 'violet' },
    { title: 'Avg Satisfaction', value: overviewStats?.averageSatisfaction != null ? overviewStats.averageSatisfaction.toFixed(1) : '-', icon: IconStar, color: 'yellow' },
    { title: 'Total Topics', value: overviewStats?.totalTopics ?? '-', icon: IconTag, color: 'teal' },
  ];

  return (
    <Container fluid p="lg">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group gap="sm">
            <IconRobot size={32} color="var(--mantine-color-indigo-6)" />
            <Title order={2}>Welcome back {firstname}</Title>
          </Group>
          <ThemeToggle />
        </Group>

        {/* Stats Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </SimpleGrid>

        {/* Analytics Grid */}
        <SimpleGrid cols={{ base: 1, lg: 2 }}>
          {ranges.map((range, index) => {
            const data = results[index].data || [];
            const transformedData = Object.entries(data).map(([keyword, count]) => ({
              keyword,
              count,
            }));

            return (
              <Card key={range} shadow="sm" padding="lg" withBorder>
                <Title order={4} mb="md" tt="capitalize">
                  {range.replace(/([A-Z])/g, ' $1')} Analytics
                </Title>
                <AnalyticsReChart data={transformedData} />
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Container>
  );
};

export default Home;
