'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Subject, ClassItem } from '@/types';
import Link from 'next/link';


export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjRes, classRes] = await Promise.all([
        api.get('/admin/subjects'),
        api.get('/admin/classes'),
      ]);
      setSubjects(Array.isArray(subjRes.data) ? subjRes.data : subjRes.data?.subjects || []);
      setClasses(Array.isArray(classRes.data) ? classRes.data : classRes.data?.classes || []);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/subjects', { name, code });
      setMsg('Subject added successfully!');
      setName('');
      setCode('');
      fetchData();
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Failed to create subject.');
    }
  };

  // const handleAssignSubjectToClass = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!selectedClassId || !selectedSubjectId) {
  //     setMsg('Please select both a class and a subject.');
  //     return;
  //   }

  //   try {
  //     // Pass normalized Guids to prevent backend model binder errors
  //     await api.post('/admin/class-subjects', {
  //       classId: selectedClassId,
  //       subjectId: selectedSubjectId,
  //     });
  //     setMsg('Subject mapped to class successfully!');
  //     setSelectedClassId('');
  //     setSelectedSubjectId('');
  //   } catch (err: any) {
  //     setMsg(err.response?.data?.message || 'Subject mapping failed. Verify class-subject binding.');
  //   }
  // };================================================================================================================


  const handleAssignSubjectToClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSubjectId) {
      setMsg('Please select both a class and a subject.');
      return;
    }
  
    try {
      // Send both PascalCase and camelCase keys to satisfy backend model binding
      await api.post('/admin/class-subjects', {
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        ClassId: selectedClassId,
        SubjectId: selectedSubjectId,
      });
      
      setMsg('Subject mapped to class successfully!');
      setSelectedClassId('');
      setSelectedSubjectId('');
    } catch (err: any) {
      console.error('Mapping error:', err.response?.data);
      setMsg(
        err.response?.data?.message ||
        err.response?.data?.title ||
        'Subject mapping failed. Check backend endpoint /api/admin/class-subjects.'
      );
    }
  };



  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
      <Link href="/admin/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
   Dashboard
</Link>
      </div>

      <h1 className="text-2xl font-bold">Subject & Curriculum Management</h1>

      {msg && <div className="p-3 bg-blue-100 text-blue-800 rounded">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Subject */}
        <form onSubmit={handleCreateSubject} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Create New Subject</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Subject Name</label>
            <input
              type="text"
              placeholder="e.g. Mathematics"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject Code</label>
            <input
              type="text"
              placeholder="e.g. MATH101"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-medium">
            Add Subject
          </button>
        </form>

        {/* Map Subject to Class */}
        <form onSubmit={handleAssignSubjectToClass} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Map Subject to Class</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Select Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full border p-2 rounded bg-white"
              required
            >
              <option value="">Choose Class...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.section ? `(${c.section})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full border p-2 rounded bg-white"
              required
            >
              <option value="">Choose Subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="bg-emerald-600 text-white px-5 py-2 rounded hover:bg-emerald-700 font-medium">
            Link Subject to Class
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-lg font-semibold border-b pb-4 mb-4">Master Subject Catalog</h2>
        {loading ? (
          <p className="text-gray-500">Loading subjects...</p>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3">Code</th>
                <th className="p-3">Subject Name</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-gray-600">{s.code}</td>
                  <td className="p-3 font-medium">{s.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}