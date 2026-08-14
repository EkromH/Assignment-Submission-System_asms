'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';

interface OptionItem {
  id: string;
  name: string;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<OptionItem[]>([]);
  const [subjects, setSubjects] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    deadline: '',
    maxMarks: 100,
    isPublished: true,
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadDropdowns() {
      try {
        // 1. Try fetching teacher-specific classes & subjects
        let classRes = await api.get('/Teacher/my-classes').catch(() => null);
        let subjectRes = await api.get('/Teacher/my-subjects').catch(() => null);

        let classList: OptionItem[] = classRes?.data || [];
        let subjectList: OptionItem[] = subjectRes?.data || [];

        // 2. Fallback to general endpoints if teacher endpoints return empty or fail
        if (classList.length === 0) {
          const fallbackClass = await api.get('/Teacher/all-classes').catch(() => null);
          classList = fallbackClass?.data || [];
        }

        if (subjectList.length === 0) {
          const fallbackSubject = await api.get('/Teacher/all-subjects').catch(() => null);
          subjectList = fallbackSubject?.data || [];
        }

        setClasses(classList);
        setSubjects(subjectList);

        setFormData((prev) => ({
          ...prev,
          classId: classList[0]?.id || '',
          subjectId: subjectList[0]?.id || '',
        }));
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
        setErrorMsg('Unable to load classes or subjects.');
      } finally {
        setLoading(false);
      }
    }
    loadDropdowns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
  
    if (!formData.classId || !formData.subjectId) {
      setErrorMsg('Please select a valid Class and Subject.');
      return;
    }
  
    setSubmitting(true);
  
    try {
      await api.post('/Teacher/assignments', {
        title: formData.title,
        description: formData.description,
        classId: formData.classId,
        subjectId: formData.subjectId,
        deadline: new Date(formData.deadline).toISOString(), // Ensures clean UTC DateTime parsing
        maxMarks: Number(formData.maxMarks),
        isPublished: formData.isPublished,
      });
  
      router.push('/teacher/assignments');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
<div>
        <Link href="/teacher/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
        Dashboard
        </Link>
      </div>

      <div>
        <Link href="/teacher/assignments" className="text-xs text-blue-600 hover:underline">
          ← Back to Assignments
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Create New Assignment</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {errorMsg && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded mb-4">{errorMsg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Assignment Title</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Dynamic Dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Class Name</label>
              <select
                required
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              >
                {loading ? (
                  <option value="">Loading classes...</option>
                ) : classes.length === 0 ? (
                  <option value="">No Classes Available</option>
                ) : (
                  classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Subject Name</label>
              <select
                required
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              >
                {loading ? (
                  <option value="">Loading subjects...</option>
                ) : subjects.length === 0 ? (
                  <option value="">No Subjects Available</option>
                ) : (
                  subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Deadline</label>
              <input
                type="datetime-local"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Maximum Marks</label>
              <input
                type="number"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <label htmlFor="isPublished" className="text-gray-700 cursor-pointer">
              Publish immediately
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/teacher/assignments')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || classes.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-gray-400"
            >
              {submitting ? 'Saving...' : 'Save Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}