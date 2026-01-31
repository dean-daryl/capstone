import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-all ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-700 shadow-md'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        title="Light theme"
      >
        <Sun className="w-4 h-4 text-yellow-500" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-all ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-700 shadow-md'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        title="Dark theme"
      >
        <Moon className="w-4 h-4 text-blue-500" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 shadow-md'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        title="System theme"
      >
        <Monitor className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}