'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import Link from 'next/link';
interface Teacher {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface ClassItem {
  id: string;
  name: string;
  section?: string;
}

interface SubjectItem {
  id: string;
  name: string;
  code: string;
}

interface AssignmentItem {
  id: string;
  teacherName: string;
  className: string;
  subjectName: string;
}

export default function AssignTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);

  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchInitialData();
    fetchAssignments();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [usersRes, classesRes] = await Promise.all([
        api.get('/Admin/users'),
        api.get('/Admin/classes'),
      ]);

      const teacherUsers = (usersRes.data || []).filter(
        (u: Teacher) => u.role === 'Teacher'
      );

      setTeachers(teacherUsers);
      setClasses(classesRes.data || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/Admin/teacher-assignments');
      setAssignments(res.data || []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    }
  };

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSubjectId('');
    setAvailableSubjects([]);

    if (!classId) return;

    setLoadingSubjects(true);
    try {
      const res = await api.get(`/Admin/classes/${classId}/subjects`);
      setAvailableSubjects(res.data || []);
    } catch (err) {
      console.error('Failed to fetch subjects for class:', err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeacherId || !selectedClassId || !selectedSubjectId) {
      setMessage('Please select a class, subject, and teacher.');
      setIsError(true);
      return;
    }

    try {
      const response = await api.post('/Admin/teacher-assignments', {
        teacherId: selectedTeacherId,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
      });

      setMessage(response.data?.message || 'Teacher assigned successfully!');
      setIsError(false);

      // Reset selection and refresh table
      setSelectedTeacherId('');
      setSelectedClassId('');
      setSelectedSubjectId('');
      setAvailableSubjects([]);
      fetchAssignments();
    } catch (err: any) {
      console.error('Assignment error:', err.response?.data);
      setMessage(err.response?.data?.message || 'Failed to assign teacher.');
      setIsError(true);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;

    try {
      await api.delete(`/Admin/teacher-assignments/${id}`);
      setMessage('Assignment removed successfully.');
      setIsError(false);
      fetchAssignments();
    } catch (err: any) {
      console.error('Delete error:', err.response?.data);
      setMessage(err.response?.data?.message || 'Failed to delete assignment.');
      setIsError(true);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
      <Link href="/admin/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
      Dashboard
    </Link>
      </div>
      <h1 className="text-2xl font-bold">Assign Teacher to Class & Subject</h1>

      {message && (
        <div
          className={`p-4 rounded border ${
            isError
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-green-50 text-green-700 border-green-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Assignment Form */}
      <form onSubmit={handleAssignTeacher} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">1. Select Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full border p-2 rounded bg-white"
            required
          >
            <option value="">-- Choose Class --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.section ? `(${c.section})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">2. Select Mapped Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full border p-2 rounded bg-white"
            disabled={!selectedClassId || loadingSubjects}
            required
          >
            <option value="">
              {!selectedClassId
                ? '-- Select a Class first --'
                : loadingSubjects
                ? 'Loading mapped subjects...'
                : availableSubjects.length === 0
                ? 'No subjects mapped to this class'
                : '-- Choose Subject --'}
            </option>
            {availableSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">3. Select Teacher</label>
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="w-full border p-2 rounded bg-white"
            required
          >
            <option value="">-- Choose Teacher --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName} ({t.email})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition"
        >
          Assign Teacher
        </button>
      </form>

      {/* Active Assignments List */}
      <div className="bg-white rounded-lg border shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Active Assignments</h2>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3">Teacher</th>
              <th className="p-3">Class</th>
              <th className="p-3">Subject</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No active teacher assignments found.
                </td>
              </tr>
            ) : (
              assignments.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{a.teacherName}</td>
                  <td className="p-3">{a.className}</td>
                  <td className="p-3">{a.subjectName}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteAssignment(a.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-semibold"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}