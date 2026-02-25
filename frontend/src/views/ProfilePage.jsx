import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircle } from 'lucide-react';

function ProfilePage() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: API call to update profile
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Profile</h1>
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <UserCircle className="w-16 h-16 text-purple-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-100">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-purple-600 text-white">
              {user?.role}
            </span>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 bg-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
