import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import apiClient from '../api/apiClient';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/users')
      .then((res) => {
        if (res.data?.data) {
          setUsers(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roleBadgeColor = {
    ADMIN: 'bg-red-600',
    TEACHER: 'bg-blue-600',
    STUDENT: 'bg-green-600',
  };

  return (
    <div className="py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-purple-400" />
        <h1 className="text-2xl font-bold text-gray-100">User Management</h1>
      </div>
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No users found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Email</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="px-6 py-4 text-sm text-gray-100">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full text-white ${
                        roleBadgeColor[u.role] || 'bg-gray-600'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UsersPage;
