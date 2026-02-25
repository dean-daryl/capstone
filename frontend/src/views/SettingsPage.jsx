import React from 'react';
import { useAuth } from '../context/AuthContext';

function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Settings</h1>
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-100">Theme</p>
              <p className="text-xs text-gray-400">Toggle between light and dark mode</p>
            </div>
            <span className="text-sm text-gray-400">Use the theme toggle in the header</span>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Notifications</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-100">Email Notifications</p>
                <p className="text-xs text-gray-400">Receive email updates about your activity</p>
              </div>
              <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">Coming soon</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Account</h2>
          <p className="text-sm text-gray-400">
            Logged in as <span className="text-gray-100">{user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
