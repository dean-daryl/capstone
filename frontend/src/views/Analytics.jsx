import React from 'react';
import { Bot, BarChart3, Users, Activity } from 'lucide-react';
import { fetchAnalyticsData } from '../api/analyticsService';
import useFetch from '../api/useFetch';
import Skeleton from './Skeleton';
import AnalyticsReChart from './charts/AnalyticsRechart';
import { getDateRange } from '../utils/dateUtils';
import ThemeToggle from '../components/ThemeToggle';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-semibold mt-2 text-gray-900 dark:text-white">-</h3>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <Icon className="w-6 h-6 text-blue-500 dark:text-blue-400" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center">
        <Activity className="w-4 h-4 text-green-500 mr-1" />
        <span className="text-sm text-green-500">-</span>
      </div>
    )}
  </div>
);

const Home = () => {
  const ranges = ['today', 'lastWeek', 'thisMonth', 'thisQuarter'];
  const firstname = localStorage.getItem('firstName') ?? '';

  const fetchDataForRange = (range) => {
    const { startDate, endDate } = getDateRange(range);
    return useFetch(() => fetchAnalyticsData(startDate, endDate));
  };

  const fetchUserAnalytics = () => {
    const userCount = useFetch(() => fetchAnalyticsData());
  }

  const results = ranges.map((range) => fetchDataForRange(range));
  const loading = results.some((result) => result.loading);
  const error = results.some((result) => result.error);

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
    { title: 'Total Users', value: '2,543', icon: Users, trend: '+12.5% from last month' },
    { title: 'Active Sessions', value: '1,234', icon: Activity, trend: '+8.2% from last week' },
    { title: 'Conversion Rate', value: '3.6%', icon: BarChart3, trend: '+2.1% from yesterday' },
    { title: 'AI Interactions', value: '10,432', icon: Bot, trend: '+15.3% from last quarter' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Bot className="w-10 h-10 text-purple-500" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Welcome back {firstname} 👋
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