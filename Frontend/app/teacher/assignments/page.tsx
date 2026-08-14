'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';

export default function ManageAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editMaxMarks, setEditMaxMarks] = useState(100);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/Teacher/assignments');
      setAssignments(res.data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await api.patch(`/Teacher/assignments/${id}/toggle-publish`);
      fetchAssignments();
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/Teacher/assignments/${id}`);
      fetchAssignments();
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    }
  };

  const openEditModal = (item: any) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setEditDeadline(item.deadline ? new Date(item.deadline).toISOString().slice(0, 16) : '');
    setEditMaxMarks(item.maxMarks || 100);
    setEditError('');
  };

  // const handleUpdateAssignment = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!editItem) return;
  //   setEditError('');

  //   try {
  //     await api.put(`/Teacher/assignments/${editItem.id}`, {
  //       title: editTitle,
  //       description: editDescription,
  //       deadline: editDeadline,
  //       maxMarks: editMaxMarks,
  //     });
  //     setEditItem(null);
  //     fetchAssignments();
  //   } catch (err: any) {
  //     setEditError(err.response?.data?.message || 'Failed to update assignment.');
  //   }
  // };


  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setEditError('');
  
    try {
      await api.put(`/Teacher/assignments/${editItem.id}`, {
        title: editTitle,
        description: editDescription,
        deadline: new Date(editDeadline).toISOString(), // Formatted for EF Core DateTime
        maxMarks: Number(editMaxMarks),
      });
  
      setEditItem(null);
      fetchAssignments(); // Refresh table view
    } catch (err: any) {
      setEditError(
        err.response?.data?.message || 'Failed to update assignment.'
      );
    }
  };

  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
         <div>
        <Link href="/teacher/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
        Dashboard
        </Link>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Assignments</h1>
          <p className="text-xs text-gray-500">Create, edit, toggle status, or remove assignments.</p>
        </div>
        <Link
          href="/teacher/assignments/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
        >
          + Create Assignment
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No assignments created yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {assignments.map((item) => (
              <div key={item.id} className="p-5 flex items-center justify-between hover:bg-gray-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        item.status === 'Published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Class: <span className="font-medium text-gray-700">{item.class?.name || 'N/A'}</span> | 
                    Subject: <span className="font-medium text-gray-700">{item.subject?.name || 'N/A'}</span> | 
                    Deadline: {new Date(item.deadline).toLocaleString()} | Max Marks: {item.maxMarks}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => openEditModal(item)}
                    className="px-3 py-1.5 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleTogglePublish(item.id)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                  >
                    {item.status === 'Published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Assignment Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Edit Assignment</h2>

            {editError && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded">{editError}</p>}

            <form onSubmit={handleUpdateAssignment} className="space-y-3 text-sm">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Max Marks</label>
                  <input
                    type="number"
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    value={editMaxMarks}
                    onChange={(e) => setEditMaxMarks(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                  Update Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}