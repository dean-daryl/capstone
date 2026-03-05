import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useMantineColorScheme, useMantineTheme } from '@mantine/core';

const AnalyticsReChart = ({ data }) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    bar: isDark ? theme.colors.indigo[4] : theme.colors.indigo[6],
    text: isDark ? theme.colors.gray[4] : theme.colors.gray[7],
    grid: isDark ? theme.colors.dark[4] : theme.colors.gray[2],
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis dataKey="keyword" tick={{ fill: colors.text }} stroke={colors.text} />
        <YAxis tick={{ fill: colors.text }} stroke={colors.text} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? theme.colors.dark[7] : '#ffffff',
            border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
            borderRadius: '8px',
            color: colors.text,
          }}
        />
        <Legend wrapperStyle={{ color: colors.text }} />
        <Bar dataKey="count" fill={colors.bar} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsReChart;
