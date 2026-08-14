'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { User, ClassItem } from '@/types';
import Link from 'next/link';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('All');

  // Create Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Admin' | 'Teacher' | 'Student'>('Student');
  const [classId, setClassId] = useState<string>('');
  const [message, setMessage] = useState('');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'Admin' | 'Teacher' | 'Student'>('Student');
  const [editClassId, setEditClassId] = useState<string>('');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      const userList = Array.isArray(response.data)
        ? response.data
        : response.data?.users || response.data?.data || [];
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load user list:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/admin/classes');
      const data = Array.isArray(response.data) ? response.data : response.data?.classes || [];
      setClasses(data);
    } catch (err) {
      console.error('Failed to fetch classes', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/admin/users', {
        fullName,
        email,
        password,
        role,
        classId: role === 'Student' && classId ? classId : null,
      });
      setMessage('User created successfully!');
      setFullName('');
      setEmail('');
      setPassword('');
      setClassId('');
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error creating user.');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditEmail(user.email);
    setEditRole(user.role as any);
    setEditClassId(user.classId || '');
    setEditPassword('');
  };

  // Close Edit Modal
  const handleCloseEdit = () => {
    setEditingUser(null);
    setEditFullName('');
    setEditEmail('');
    setEditRole('Student');
    setEditClassId('');
    setEditPassword('');
  };

  // Submit Update
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        fullName: editFullName,
        email: editEmail,
        role: editRole,
        classId: editRole === 'Student' && editClassId ? editClassId : null,
        password: editPassword.trim() !== '' ? editPassword : null,
      });
      setMessage('User updated successfully!');
      handleCloseEdit();
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error updating user.');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setMessage('User deleted successfully!');
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`, { isActive: !currentStatus });
      fetchUsers();
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const filteredUsers = filterRole === 'All' ? users : users.filter((u) => u.role === filterRole);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
      <Link href="/admin/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
         Dashboard
      </Link>
      </div>

      <h1 className="text-2xl font-bold">User Management</h1>

      {message && <div className="p-3 bg-blue-100 text-blue-800 rounded">{message}</div>}

      {/* Create User Form */}
      <form onSubmit={handleCreateUser} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Add New User</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full border p-2 rounded bg-white"
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {role === 'Student' && (
            <div>
              <label className="block text-sm font-medium mb-1">Assign Class</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full border p-2 rounded bg-white"
              >
                <option value="">Select Class...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.section ? `(${cls.section})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-medium">
          Create User
        </button>
      </form>

      {/* User Directory Table */}
      <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-semibold">User Directory</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Filter Role:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border p-1.5 rounded text-sm bg-white"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No users found.</p>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                {/* <th className="p-3">Assigned Class</th> */}
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.fullName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        u.role === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'Teacher'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  {/* <td className="p-3">{u.className || '-'}</td> */}
                  {/* <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td> */}
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.isActive)}
                      className={`text-xs px-2.5 py-1 rounded border ${
                        u.isActive
                          ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          : 'border-green-300 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="text-xs px-2.5 py-1 rounded border border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.fullName)}
                      className="text-xs px-2.5 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-xl">
            <h2 className="text-xl font-bold">Edit User</h2>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full border p-2 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full border p-2 rounded bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full border p-2 rounded bg-white"
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {editRole === 'Student' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Assigned Class</label>
                  <select
                    value={editClassId}
                    onChange={(e) => setEditClassId(e.target.value)}
                    className="w-full border p-2 rounded bg-white"
                  >
                    <option value="">-- None --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.section ? `(${cls.section})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password <span className="text-xs text-gray-500">(Leave blank to keep unchanged)</span>
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border p-2 rounded bg-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}