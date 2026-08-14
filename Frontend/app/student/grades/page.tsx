'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';

interface GradeRecord {
  id: string;
  assignmentTitle: string;
  subjectName?: string;
  maxMarks: number;
  obtainedMarks?: number;
  status: string;
  feedback?: string;
  submittedAt: string;
}

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await api.get(`/Student/grades?t=${Date.now()}`);
      setGrades(res.data || []);
    } catch (err) {
      console.error('Failed to fetch grades history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Grades...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <Link href="/student/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
        Dashboard
        </Link>
      </div>



      <div>
        <h1 className="text-3xl font-bold text-gray-900">Grades & Feedback</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review instructor evaluations, obtained marks, and submission history.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
            <tr>
              <th className="px-6 py-3">Assignment</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Submitted Date</th>
              <th className="px-6 py-3">Score / Max Marks</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {grades.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No grade records found.
                </td>
              </tr>
            ) : (
              grades.map((item) => {
                const isGraded = (item.status || '').toLowerCase() === 'graded';
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {item.assignmentTitle}
                    </td>
                    <td className="px-6 py-4">{item.subjectName || 'General'}</td>
                    <td className="px-6 py-4">
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {isGraded ? `${item.obtainedMarks ?? 0} / ${item.maxMarks}` : `- / ${item.maxMarks}`}
                    </td>
                    <td className="px-6 py-4">
                      {isGraded ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                          Graded
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-700 max-w-xs">
                      {item.feedback || (isGraded ? 'No written feedback' : 'Awaiting grading')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}