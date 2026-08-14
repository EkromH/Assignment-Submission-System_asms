'use client';

import { useEffect, useState } from 'react';
import api from '@/services/api';
import Link from 'next/link';

// 1. Helper function to enforce consistent "Class X" naming convention
export const formatClassName = (name?: string) => {
  if (!name || name.toLowerCase() === 'general') return 'General';
  
  // Replace "Grade" (case-insensitive) with "Class"
  let formatted = name.replace(/Grade/gi, 'Class');
  
  // If the string is just a number (e.g., "9"), format it as "Class 9"
  if (/^\d+$/.test(formatted.trim())) {
    formatted = `Class ${formatted.trim()}`;
  }
  
  return formatted;
};

interface Submission {
  id?: string;
  Id?: string;
  submittedAt?: string;
  SubmittedAt?: string;
  content?: string;
  Content?: string;
  status?: string;
  Status?: string;
  marks?: number;
  Marks?: number;
  feedback?: string;
  Feedback?: string;
}

interface Assignment {
  id?: string;
  Id?: string;
  title?: string;
  Title?: string;
  description?: string;
  Description?: string;
  subjectName?: string;
  SubjectName?: string;
  className?: string;
  ClassName?: string;
  deadline?: string;
  Deadline?: string;
  maxMarks?: number;
  MaxMarks?: number;
  submission?: Submission;
  Submission?: Submission;
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<Assignment | null>(null);

  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/Student/assignments?t=${Date.now()}`);
      const data = response.data?.data || response.data || [];
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (assignment: Assignment) => {
    const sub = assignment.submission || assignment.Submission;
    setActiveModal(assignment);
    setSubmissionContent(sub?.content || sub?.Content || '');
    setErrorMsg('');
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    const assignId = activeModal.id || activeModal.Id;

    if (!submissionContent.trim()) {
      setErrorMsg('Please enter your answer before submitting.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.post(`/Student/assignments/${assignId}/submit`, {
        content: submissionContent,
      });

      setActiveModal(null);
      fetchAssignments();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading assignments workspace...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/student/dashboard"
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
        >
          ← Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Assignments Workspace</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review active coursework tasks for your class, submit answers, and check grading status.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
            <tr>
              <th className="px-6 py-3">Assignment</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3">Deadline</th>
              <th className="px-6 py-3">Max Marks</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No assignments available for your class at this time.
                </td>
              </tr>
            ) : (
              assignments.map((item, index) => {
                const id = item.id || item.Id || String(index);
                const title = item.title || item.Title || 'Untitled Assignment';
                const description = item.description || item.Description || '';
                const subject = item.subjectName || item.SubjectName || 'General';
                
                // 2. Apply formatting to the class string before rendering
                const className = formatClassName(item.className || item.ClassName);
                
                const deadline = item.deadline || item.Deadline;
                const maxMarks = item.maxMarks ?? item.MaxMarks ?? 0;
                const sub = item.submission || item.Submission;

                const status = (sub?.status || sub?.Status || '').toLowerCase();
                const marks = sub?.marks ?? sub?.Marks;
                const isGraded = status === 'graded';
                const isSubmitted = !!sub;

                return (
                  <tr key={id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{description}</p>
                    </td>
                    <td className="px-6 py-4">{subject}</td>
                    <td className="px-6 py-4 font-medium text-gray-700">{className}</td>
                    <td className="px-6 py-4">
                      {deadline ? new Date(deadline).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{maxMarks}</td>
                    <td className="px-6 py-4">
                      {isGraded ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Graded ({marks}/{maxMarks})
                        </span>
                      ) : isSubmitted ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                          Submitted
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenSubmit(item)}
                        disabled={isGraded}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                          isGraded
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isSubmitted
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isGraded ? 'Graded' : isSubmitted ? 'Edit Answer' : 'Submit Answer'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Submission Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xl w-full max-w-lg space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Submit: {activeModal.title || activeModal.Title}
            </h2>
            <p className="text-xs text-gray-500">{activeModal.description || activeModal.Description}</p>

            {errorMsg && <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded">{errorMsg}</p>}

            <form onSubmit={handleSubmitAssignment} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Your Answer / Text Response</label>
                <textarea
                  rows={6}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  placeholder="Enter your response or solution here..."
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}