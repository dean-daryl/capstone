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
import { useTheme } from '../../context/ThemeContext';

const AnalyticsReChart = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const colors = {
    bar: isDark ? '#818cf8' : '#4f46e5',
    text: isDark ? '#e5e7eb' : '#1f2937',
    grid: isDark ? '#374151' : '#e5e7eb',
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis
          dataKey="keyword"
          tick={{ fill: colors.text }}
          stroke={colors.text}
        />
        <YAxis tick={{ fill: colors.text }} stroke={colors.text} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            color: colors.text,
          }}
        />
        <Legend wrapperStyle={{ color: colors.text }} />
        <Bar
          dataKey="count"
          fill={colors.bar}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsReChart;