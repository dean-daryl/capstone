import React from 'react';
import { Link } from 'react-router-dom';
import { Image, MessageSquare, Play } from 'lucide-react';



function RecentActivityItem({ activity }) {
  const truncatedTitle = activity.title
    .replace(/^"|"$/g, '')
    .slice(0, 26) + (activity.title.length > 30 ? '...' : '');

  return (
    <Link to={`/dashboard/activity/${activity.id}`}>
      <div className="flex items-center gap-3 px-2 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-800/10 dark:hover:bg-gray-700/50">
        <div className="flex-shrink-0">
    {
            activity.conversationType === "TEXT" && (
          <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            )
    }
    {
            activity.conversationType === "IMAGE" && (
                <Image className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          
            )
    }
    {
            activity.conversationType === "VIDEO" && (
                <Play className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          
            )
    }
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
          {truncatedTitle}
        </p>
      </div>
    </Link>
  );
}

export default RecentActivityItem;