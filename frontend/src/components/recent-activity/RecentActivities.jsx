import React, { useEffect, useState } from 'react';
import { getRecentActivity } from '../../api/recentActivityService';
import { getDateRange } from '../../utils/dateUtils';
import RecentActivityItem from './RecentActivityItem';
import { Clock, CalendarDays, CalendarRange, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function RecentActivities() {
  const { user } = useAuth();
  const [sections, setSections] = useState([
    { title: 'Today', icon: Clock, data: [], dateRange: 'today' },
    { title: 'Yesterday', icon: CalendarDays, data: [], dateRange: 'yesterday' },
    { title: 'Last 7 days', icon: CalendarRange, data: [], dateRange: 'last7Days' },
    { title: 'Last 30 days', icon: History, data: [], dateRange: 'last30Days' }
  ]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchActivities = async () => {
      const updatedSections = await Promise.all(
        sections.map(async (section) => {
          const { startDate, endDate } = getDateRange(section.dateRange);
          const activities = await getRecentActivity(
            user.id,
            startDate,
            endDate,
            1,
            10
          );
          return { ...section, data: activities.content || [] };
        })
      );
      setSections(updatedSections);
    };

    fetchActivities();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        section.data.length > 0 && (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-2 px-2 text-gray-400 dark:text-gray-500">
              <section.icon className="w-4 h-4" />
              <h3 className="text-sm font-medium">{section.title}</h3>
            </div>
            <div className="space-y-1">
              {section.data.map((activity, idx) => (
                <RecentActivityItem key={idx} activity={activity} />
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}

export default RecentActivities;