'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState({
    totalAssignments: 0,
    submittedAssignments: 0,
    pendingSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/Teacher/dashboard-stats').catch(() => null);

        if (res?.data) {
          setStats({
            totalAssignments: res.data.totalAssignments || 0,
            submittedAssignments: res.data.submittedAssignments || 0,
            pendingSubmissions: res.data.pendingSubmissions || 0,
          });
        } else {
          // Fallback calculation directly from assignments endpoint
          const fallbackRes = await api.get('/Teacher/assignments');
          const assignments = fallbackRes.data || [];

          let totalSubmissions = 0;
          let pendingCount = 0;

          assignments.forEach((assignment: any) => {
            const subs = assignment.submissions || assignment.Submissions || [];
            totalSubmissions += subs.length;

            subs.forEach((s: any) => {
              const status = (s.status || s.Status || '').toLowerCase();
              if (status !== 'graded') {
                pendingCount++;
              }
            });
          });

          setStats({
            totalAssignments: assignments.length,
            submittedAssignments: totalSubmissions,
            pendingSubmissions: pendingCount,
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your assigned classes, subjects, and submissions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Assignments</p>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">{loading ? '...' : stats.totalAssignments}</p>
        </div>
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Submitted Assignments</p>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">{loading ? '...' : stats.submittedAssignments}</p>
        </div>
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Grading</p>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">{loading ? '...' : stats.pendingSubmissions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/teacher/assignments"
          className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 transition group"
        >
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Assignments Workspace</h3>
          <p className="text-xs text-gray-500 mt-1">Manage, edit, or toggle publish status for assignments.</p>
        </Link>
        <Link
          href="/teacher/assignments/create"
          className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 transition group"
        >
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Create Assignment</h3>
          <p className="text-xs text-gray-500 mt-1">Draft a new coursework assignment or task.</p>
        </Link>
        <Link
          href="/teacher/submissions/grade"
          className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 transition group"
        >
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Grade Submissions</h3>
          <p className="text-xs text-gray-500 mt-1">Review student submissions and assign marks.</p>
        </Link>
      </div>
    </div>
  );
}