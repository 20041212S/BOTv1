'use client';

import { useState, useEffect } from 'react';

type UserType = 'all' | 'student' | 'guest' | 'parent';

interface ClientUser {
  id: string;
  mobile: string;
  email: string;
  userType: string;
  createdAt: string;
}

export default function ClientUsersPage() {
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<UserType>('all');
  const [selectedUser, setSelectedUser] = useState<ClientUser | null>(null);
  const [error, setError] = useState('');

  // Fetch users based on filter
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const url = filter === 'all' 
          ? '/api/admin/client-users'
          : `/api/admin/client-users?userType=${filter}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch users');
        
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filter]);

  // Download CSV
  const handleDownloadCSV = async () => {
    try {
      const url = filter === 'all'
        ? '/api/admin/client-users/download'
        : `/api/admin/client-users/download?userType=${filter}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download CSV');

      const blob = await response.blob();
      const csvUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = csvUrl;
      a.download = `client-users-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(csvUrl);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registered Clients</h1>
          <p className="text-gray-600 mt-2">Manage and view all client user registrations</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'student', 'guest', 'parent'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilter(type);
                    setSelectedUser(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === type
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? 'All Users' : type.charAt(0).toUpperCase() + type.slice(1)}
                  {users.length > 0 && filter === type && ` (${users.length})`}
                </button>
              ))}
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadCSV}
              disabled={loading || users.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-all"
            >
              📥 Download CSV
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No users found for this filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mobile</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Registered</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">{user.mobile}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.userType === 'student' ? 'bg-blue-100 text-blue-800' :
                          user.userType === 'guest' ? 'bg-yellow-100 text-yellow-800' :
                          user.userType === 'parent' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()} {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stats Footer */}
          {users.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
              Showing {users.length} user{users.length !== 1 ? 's' : ''}
              {filter !== 'all' && ` (${filter})`}
            </div>
          )}
        </div>

        {/* Detail Drawer */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50">
            <div className="bg-white w-full max-w-md rounded-t-2xl shadow-2xl animate-slide-up">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-600 hover:text-gray-900 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* User Type Badge */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">User Type</label>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium inline-block ${
                    selectedUser.userType === 'student' ? 'bg-blue-100 text-blue-800' :
                    selectedUser.userType === 'guest' ? 'bg-yellow-100 text-yellow-800' :
                    selectedUser.userType === 'parent' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedUser.userType.charAt(0).toUpperCase() + selectedUser.userType.slice(1)}
                  </span>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Mobile Number</label>
                  <p className="text-lg text-gray-900 font-mono">{selectedUser.mobile}</p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                  <p className="text-lg text-gray-900 break-all">{selectedUser.email}</p>
                </div>

                {/* Registration Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Registered On</label>
                  <p className="text-lg text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </div>

                {/* ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">User ID</label>
                  <p className="text-sm text-gray-700 font-mono break-all bg-gray-100 p-3 rounded">
                    {selectedUser.id}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full mt-8 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
