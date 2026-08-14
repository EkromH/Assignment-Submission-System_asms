'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';

interface StudentStats {
  totalAssignments: number;
  submittedAssignments: number;
  pendingAssignments: number;
  gradedAssignments: number;
}

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<StudentStats>({
    totalAssignments: 0,
    submittedAssignments: 0,
    pendingAssignments: 0,
    gradedAssignments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await api.get('/Student/dashboard-stats').catch(() => null);

        if (res?.data) {
          setStats({
            totalAssignments: res.data.totalAssignments || 0,
            submittedAssignments: res.data.submittedAssignments || 0,
            pendingAssignments: res.data.pendingAssignments || 0,
            gradedAssignments: res.data.gradedAssignments || 0,
          });
        } else {
          // Fallback calculation from assignments endpoint if stats endpoint is not built
          const assignmentsRes = await api.get('/Student/assignments');
          const list = assignmentsRes.data || [];

          let submitted = 0;
          let graded = 0;

          list.forEach((item: any) => {
            const submission = item.submission || item.Submission;
            if (submission) {
              submitted++;
              if ((submission.status || submission.Status)?.toLowerCase() === 'graded') {
                graded++;
              }
            }
          });

          setStats({
            totalAssignments: list.length,
            submittedAssignments: submitted,
            pendingAssignments: list.length - submitted,
            gradedAssignments: graded,
          });
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Student Dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Assigned', value: stats.totalAssignments, color: 'bg-blue-500' },
    { title: 'Pending Work', value: stats.pendingAssignments, color: 'bg-amber-500' },
    { title: 'Submitted', value: stats.submittedAssignments, color: 'bg-emerald-500' },
    { title: 'Graded Tasks', value: stats.gradedAssignments, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Track coursework, upcoming deadlines, and grade records.</p>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.title}</p>
              <p className="text-3xl font-extrabold text-gray-800 mt-2">{card.value}</p>
            </div>
            <div className={`w-3 h-12 rounded-full ${card.color}`} />
          </div>
        ))}
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/student/assignments"
          className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 transition group"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600">Classwork & Assignments</h3>
            <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">View active coursework, task guidelines, and upload submissions.</p>
        </Link>

        <Link
          href="/student/grades"
          className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 transition group"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600">Grades & Feedback</h3>
            <span className="text-blue-600 group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Check marks obtained, submission history, and instructor notes.</p>
        </Link>
      </div>
    </div>
  );
}