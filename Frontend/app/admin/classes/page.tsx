'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { ClassItem } from '@/types';
import Link from 'next/link';


export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/admin/classes');
      setClasses(response.data);
    } catch (err) {
      console.error('Failed to load classes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/classes', { name, section, academicYear });
      setMsg('Class created successfully!');
      setName('');
      setSection('');
      fetchClasses();
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Failed to create class.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    try {
      await api.delete(`/admin/classes/${id}`);
      fetchClasses();
    } catch (err) {
      console.error('Failed to delete class', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
      <Link href="/admin/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
      Dashboard
      </Link>
      </div>
      <h1 className="text-2xl font-bold">Class & Section Management</h1>

      {msg && <div className="p-3 bg-blue-100 text-blue-800 rounded">{msg}</div>}

      <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Add New Class</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class Name</label>
            <input
              type="text"
              placeholder="e.g. Grade 10"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Section (Optional)</label>
            <input
              type="text"
              placeholder="e.g. A"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Academic Year</label>
            <input
              type="text"
              required
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-medium">
          Save Class
        </button>
      </form>

      <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Class Directory</h2>
        {loading ? (
          <p className="text-gray-500">Loading classes...</p>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3">Class Name</th>
                <th className="p-3">Section</th>
                <th className="p-3">Academic Year</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{cls.name}</td>
                  <td className="p-3">{cls.section || 'N/A'}</td>
                  <td className="p-3">{cls.academicYear}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(cls.id)}
                      className="text-xs px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
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
    </div>
  );
}
