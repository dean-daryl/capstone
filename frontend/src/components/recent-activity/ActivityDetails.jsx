import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bot, ArrowLeft } from 'lucide-react';
import { getRecentActivityById } from '../../api/recentActivityService';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';


function ActivityDetails() {
  const { id } = useParams();
  const [conversationData, setConversationData] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchConversationData = async () => {
      if (id) {
        const response = await getRecentActivityById(id);
        setConversationData(response);
      }
    };
    fetchConversationData();
  }, [id]);

  const renderContent = (conversationData, key, value) => {
    if (key.includes('prompt') && value.includes('<iframe')) {
      return (
        <div className="w-full max-w-4xl mx-auto">
          <div
            className="rounded-lg overflow-hidden shadow-lg"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        </div>
      );
    }

    if (conversationData.conversationType === 'IMAGE' && key.includes('prompt')) {
      console.log(value)
      return (
        <div className="flex justify-center max-w-2xl mx-auto">
          <img
            src={value}
            alt="Generated content"
            className="rounded-lg shadow-lg w-full object-cover"
          />
        </div>
      );
    }

    const isUserMessage = key.includes('prompt');
    return (
      <div
        className={`flex max-w-4xl mx-auto ${
          isUserMessage ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`flex items-start gap-4 ${
            isUserMessage
              ? 'flex-row-reverse'
              : 'flex-row'
          }`}
        >
          {!isUserMessage && (
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            </div>
          )}
          <div
            className={`px-4 py-3 rounded-lg ${
              isUserMessage
                ? 'bg-gray-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
            }`}
          >
            <p className="text-sm whitespace-pre-line">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-500" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Conversation Details
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {conversationData &&
            Object.entries(conversationData.conversation).map(([key, value], index) => (
              <div key={index} className="animate-fade-in">
                {renderContent(conversationData, key, value)}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default ActivityDetails;