import React, { useState, useEffect } from 'react';
import { Bot, FileText, MessageSquare, Star, Tag } from 'lucide-react';
import { fetchAnalyticsData } from '../api/analyticsService';
import { fetchOverviewStats } from '../api/statsService';
import useFetch from '../api/useFetch';
import Skeleton from './Skeleton';
import AnalyticsReChart from './charts/AnalyticsRechart';
import { getDateRange } from '../utils/dateUtils';
import ThemeToggle from '../components/ThemeToggle';

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">{value}</h3>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
      </div>
    </div>
  </div>
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
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton width="200px" height="30px" />
          <Skeleton width="120px" height="40px" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="120px" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} height="400px" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { title: 'Total Documents', value: overviewStats?.totalDocuments ?? '-', icon: FileText },
    { title: 'Total Queries', value: overviewStats?.totalQueries ?? '-', icon: MessageSquare },
    { title: 'Avg Satisfaction', value: overviewStats?.averageSatisfaction != null ? overviewStats.averageSatisfaction.toFixed(1) : '-', icon: Star },
    { title: 'Total Topics', value: overviewStats?.totalTopics ?? '-', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Bot className="w-10 h-10 text-purple-500" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Welcome back {firstname}
            </h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ranges.map((range, index) => {
            const data = results[index].data || [];
            const transformedData = Object.entries(data).map(([keyword, count]) => ({
              keyword,
              count,
            }));

            return (
              <div
                key={range}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white capitalize">
                  {range.replace(/([A-Z])/g, ' $1')} Analytics
                </h2>
                <div className="overflow-hidden">
                  <AnalyticsReChart data={transformedData} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;