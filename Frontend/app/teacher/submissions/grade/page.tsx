'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';

interface Student {
  id?: string;
  fullName?: string;
  userName?: string;
}

interface Submission {
  id: string;
  studentId: string;
  student?: Student;
  submittedAt: string;
  status: string;
  marks?: number;
  feedback?: string;
  content?: string;
  fileUrl?: string;
  attachmentUrl?: string;
}

interface Assignment {
  id: string;
  title: string;
  maxMarks?: number;
}

export default function GradeSubmissionsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  // Grading Modal State
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [marks, setMarks] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/Teacher/assignments');
      const data = res.data?.data || res.data || [];
      setAssignments(data);
      if (data.length > 0) {
        setSelectedAssignmentId(data[0].id);
        fetchSubmissions(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  };

  const fetchSubmissions = async (assignmentId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/Teacher/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentChange = (id: string) => {
    setSelectedAssignmentId(id);
    fetchSubmissions(id);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;
    setErrorMsg('');

    try {
      await api.post(`/Teacher/submissions/${activeSubmission.id}/grade`, {
        marks,
        feedback,
      });
      setActiveSubmission(null);
      fetchSubmissions(selectedAssignmentId);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to grade submission.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <Link href="/teacher/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grade Submissions</h1>
          <p className="text-xs text-gray-500">Review student work and assign grades.</p>
        </div>

        {/* Assignment Filter Selector */}
        {assignments.length > 0 && (
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
            value={selectedAssignmentId}
            onChange={(e) => handleAssignmentChange(e.target.value)}
          >
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading submissions...</div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No submissions found for this assignment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 text-gray-500 border-b text-xs uppercase font-semibold">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Submitted Answer / File</th>
                  <th className="p-3">Submitted At</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Marks</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {submissions.map((sub) => {
                  const fileUrl = sub.fileUrl || sub.attachmentUrl;
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold text-gray-900">
                        {sub.student?.fullName || sub.student?.userName || sub.studentId}
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="truncate text-xs text-gray-800 font-normal">
                          {sub.content ? sub.content : <span className="italic text-gray-400">No written answer</span>}
                        </div>
                        {fileUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-1 font-medium"
                          >
                            📎 View Attachment
                          </a>
                        )}
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            sub.status === 'Graded'
                              ? 'bg-green-100 text-green-800'
                              : sub.status === 'Late'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {sub.status || 'Submitted'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-gray-800">
                        {sub.marks !== undefined && sub.marks !== null ? sub.marks : '-'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setActiveSubmission(sub);
                            setMarks(sub.marks || 0);
                            setFeedback(sub.feedback || '');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-700 transition"
                        >
                          {sub.status === 'Graded' ? 'Edit Grade' : 'Grade'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grade Submission Modal with Answer Display */}
      {activeSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Grade Submission
                </h2>
                <p className="text-xs text-gray-500">
                  Student: <span className="font-semibold text-gray-800">{activeSubmission.student?.fullName || activeSubmission.student?.userName || 'Student'}</span>
                </p>
              </div>
              <button 
                onClick={() => setActiveSubmission(null)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Student's Submitted Content Box */}
            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                Submitted Answer
              </label>
              <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 border border-gray-200 rounded max-h-48 overflow-y-auto leading-relaxed">
                {activeSubmission.content ? (
                  activeSubmission.content
                ) : (
                  <span className="text-gray-400 italic">No text content provided for this submission.</span>
                )}
              </div>

              {/* Attachment link in Modal */}
              {(activeSubmission.fileUrl || activeSubmission.attachmentUrl) && (
                <div className="pt-1">
                  <a
                    href={activeSubmission.fileUrl || activeSubmission.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-xs font-semibold hover:bg-indigo-100 transition"
                  >
                    📎 Open Submitted File Attachment
                  </a>
                </div>
              )}
            </div>

            {errorMsg && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">{errorMsg}</p>}

            <form onSubmit={handleGradeSubmit} className="space-y-4 text-sm pt-2">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Marks</label>
                <input
                  type="number"
                  required
                  min={0}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={marks}
                  onChange={(e) => setMarks(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Feedback</label>
                <textarea
                  rows={3}
                  placeholder="Provide constructive feedback for the student..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveSubmission(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-xs shadow-sm transition"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}