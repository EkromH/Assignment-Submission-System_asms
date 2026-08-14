// 'use client';

// import { useEffect, useState, useMemo } from 'react';
// import Link from 'next/link';
// import api from '@/services/api';

// interface DashboardStats {
//   totalUsers: number;
//   totalTeachers: number;
//   totalStudents: number;
//   totalClasses: number;
//   totalSubjects: number;
//   totalAssignments: number;
//   totalSubmissions: number;
//   pendingGrading: number;
// }

// interface AssignmentDetail {
//   id: string;
//   title: string;
//   subjectName?: string;
//   className?: string;
//   teacherName?: string;
//   deadline: string;
//   maxMarks: number;
// }

// interface SubmissionDetail {
//   id: string;
//   assignmentTitle: string;
//   studentName: string;
//   submittedAt: string;
//   status: string;
//   marks?: number;
//   className?: string;
// }

// const ITEMS_PER_PAGE = 5;

// const adminModules = [
//   {
//     title: 'User Management',
//     description: 'Create, update, and manage student, teacher, and admin accounts.',
//     href: '/admin/users',
//     iconColor: 'bg-blue-600',
//   },
//   {
//     title: 'Class & Section',
//     description: 'Setup classes, manage sections, and organize academic structures.',
//     href: '/admin/classes',
//     iconColor: 'bg-emerald-600',
//   },
//   {
//     title: 'Subject & Curriculum',
//     description: 'Define academic subjects, course material, and syllabi.',
//     href: '/admin/subjects',
//     iconColor: 'bg-rose-600',
//   },
//   {
//     title: 'Assign Teacher',
//     description: 'Assign faculty members to specific subjects and classes.',
//     href: '/admin/assign-teacher',
//     iconColor: 'bg-amber-600',
//   },
//   {
//     title: 'Global Settings',
//     description: 'Configure system-wide portal preferences and configurations.',
//     href: '/admin/settings',
//     iconColor: 'bg-purple-600',
//   },
// ];

// export default function AdminDashboardPage() {
//   const [stats, setStats] = useState<DashboardStats>({
//     totalUsers: 0,
//     totalTeachers: 0,
//     totalStudents: 0,
//     totalClasses: 0,
//     totalSubjects: 0,
//     totalAssignments: 0,
//     totalSubmissions: 0,
//     pendingGrading: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   // Tabs state: 'assignments' | 'submissions' | 'pending'
//   const [activeTab, setActiveTab] = useState<'assignments' | 'submissions' | 'pending'>('assignments');
//   const [assignmentsList, setAssignmentsList] = useState<AssignmentDetail[]>([]);
//   const [submissionsList, setSubmissionsList] = useState<SubmissionDetail[]>([]);
//   const [detailsLoading, setDetailsLoading] = useState(false);

//   // Filter States
//   const [searchStudent, setSearchStudent] = useState('');
//   const [selectedClass, setSelectedClass] = useState('');

//   // Pagination State
//   const [currentPage, setCurrentPage] = useState(1);

//   useEffect(() => {
//     fetchStatsAndDetails();
//   }, []);

//   // Reset pagination when tab or filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [activeTab, searchStudent, selectedClass]);

//   const fetchStatsAndDetails = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get(`/admin/dashboard-stats?t=${Date.now()}`);
//       const data = response.data?.data || response.data;

//       setStats({
//         totalUsers: data.totalUsers ?? data.TotalUsers ?? 0,
//         totalTeachers: data.totalTeachers ?? data.TotalTeachers ?? 0,
//         totalStudents: data.totalStudents ?? data.TotalStudents ?? 0,
//         totalClasses: data.totalClasses ?? data.TotalClasses ?? 0,
//         totalSubjects: data.totalSubjects ?? data.TotalSubjects ?? 0,
//         totalAssignments: data.totalAssignments ?? data.TotalAssignments ?? 0,
//         totalSubmissions: data.totalSubmissions ?? data.TotalSubmissions ?? 0,
//         pendingGrading: data.pendingGrading ?? data.PendingGrading ?? 0,
//       });

//       fetchDetailedData();
//     } catch (error: any) {
//       console.error('Failed to load dashboard metrics:', error.response?.status || error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDetailedData = async () => {
//     setDetailsLoading(true);
//     try {
//       const assignRes = await api.get(`/admin/assignments?t=${Date.now()}`);
//       setAssignmentsList(assignRes.data?.data || assignRes.data || []);

//       const subRes = await api.get(`/admin/submissions?t=${Date.now()}`);
//       setSubmissionsList(subRes.data?.data || subRes.data || []);
//     } catch (err) {
//       console.error('Failed to load detailed record data:', err);
//     } finally {
//       setDetailsLoading(false);
//     }
//   };

//   // Derive unique classes from data dynamically for filter options
//   const classOptions = useMemo(() => {
//     const classes = new Set<string>();
//     assignmentsList.forEach((a) => a.className && classes.add(a.className));
//     submissionsList.forEach((s) => s.className && classes.add(s.className));
//     return Array.from(classes);
//   }, [assignmentsList, submissionsList]);

//   // Tab 1: Assignments Filtering
//   const filteredAssignments = useMemo(() => {
//     return assignmentsList.filter((item) => {
//       const matchClass = selectedClass ? (item.className || '').toLowerCase() === selectedClass.toLowerCase() : true;
//       return matchClass;
//     });
//   }, [assignmentsList, selectedClass]);

//   // Tab 2: Submissions Filtering
//   const filteredSubmissions = useMemo(() => {
//     return submissionsList.filter((item) => {
//       const matchStudent = searchStudent
//         ? (item.studentName || '').toLowerCase().includes(searchStudent.toLowerCase())
//         : true;
//       const matchClass = selectedClass
//         ? (item.className || '').toLowerCase() === selectedClass.toLowerCase()
//         : true;
//       return matchStudent && matchClass;
//     });
//   }, [submissionsList, searchStudent, selectedClass]);

//   // Tab 3: Pending Grading Filtering
//   const filteredPendingSubmissions = useMemo(() => {
//     return submissionsList.filter((item) => {
//       const isNotGraded = (item.status || '').toLowerCase() !== 'graded';
//       const matchStudent = searchStudent
//         ? (item.studentName || '').toLowerCase().includes(searchStudent.toLowerCase())
//         : true;
//       const matchClass = selectedClass
//         ? (item.className || '').toLowerCase() === selectedClass.toLowerCase()
//         : true;
//       return isNotGraded && matchStudent && matchClass;
//     });
//   }, [submissionsList, searchStudent, selectedClass]);

//   // Get current dataset based on active tab
//   const activeDataset = useMemo(() => {
//     if (activeTab === 'assignments') return filteredAssignments;
//     if (activeTab === 'submissions') return filteredSubmissions;
//     return filteredPendingSubmissions;
//   }, [activeTab, filteredAssignments, filteredSubmissions, filteredPendingSubmissions]);

//   // Calculate pagination details
//   const totalPages = Math.ceil(activeDataset.length / ITEMS_PER_PAGE) || 1;
//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     return activeDataset.slice(start, start + ITEMS_PER_PAGE);
//   }, [activeDataset, currentPage]);

//   if (loading) {
//     return <div className="p-8 text-center text-gray-500">Loading Dashboard Metrics...</div>;
//   }

//   const statCards = [
//     { title: 'Total Users', value: stats.totalUsers, color: 'bg-blue-500' },
//     { title: 'Total Teachers', value: stats.totalTeachers, color: 'bg-emerald-500' },
//     { title: 'Total Students', value: stats.totalStudents, color: 'bg-indigo-500' },
//     { title: 'Total Classes', value: stats.totalClasses, color: 'bg-amber-500' },
//     { title: 'Total Subjects', value: stats.totalSubjects, color: 'bg-rose-500' },
//     { title: 'Total Assignments', value: stats.totalAssignments, color: 'bg-purple-500' },
//     { title: 'Total Submissions', value: stats.totalSubmissions, color: 'bg-teal-500' },
//     { title: 'Pending Grading', value: stats.pendingGrading, color: 'bg-orange-500' },
//   ];

//   return (
//     <div className="p-6 max-w-7xl mx-auto space-y-8">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
//         <p className="text-gray-500 text-sm mt-1">Platform metrics overview and system controls</p>
//       </div>

//       {/* Metrics Section */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
//         {statCards.map((card, idx) => (
//           <div key={idx} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-between">
//             <div>
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.title}</p>
//               <p className="text-3xl font-extrabold text-gray-800 mt-2">{card.value}</p>
//             </div>
//             <div className={`w-3 h-12 rounded-full ${card.color}`} />
//           </div>
//         ))}
//       </div>
//       <br/>
//       {/* Detailed Overview Section */}
//       <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//         {/* Header Tabs */}
//         <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
//           <h2 className="text-lg font-bold text-violet-800">Academic Overview Details</h2>
//           <div className="flex gap-2">
//             <button
//               onClick={() => setActiveTab('assignments')}
//               className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
//                 activeTab === 'assignments'
//                   ? 'bg-purple-600 text-white shadow-sm'
//                   : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
//               }`}
//             >
//               Assignments ({stats.totalAssignments})
//             </button>
//             <button
//               onClick={() => setActiveTab('submissions')}
//               className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
//                 activeTab === 'submissions'
//                   ? 'bg-teal-600 text-white shadow-sm'
//                   : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
//               }`}
//             >
//               Submissions ({stats.totalSubmissions})
//             </button>
//             <button
//               onClick={() => setActiveTab('pending')}
//               className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
//                 activeTab === 'pending'
//                   ? 'bg-orange-600 text-white shadow-sm'
//                   : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
//               }`}
//             >
//               Pending Grading ({stats.pendingGrading})
//             </button>
//           </div>
//         </div>

//         {/* Filters Toolbar */}
//         <div className="p-4 bg-gray-50/50 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
//           <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
//             {/* Student Name Filter (Shown for Submissions & Pending) */}
//             {activeTab !== 'assignments' && (
//               <div className="relative flex-1 sm:flex-initial">
//                 <input
//                   type="text"
//                   placeholder="Search student name..."
//                   value={searchStudent}
//                   onChange={(e) => setSearchStudent(e.target.value)}
//                   className="w-full sm:w-64 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white text-gray-800"
//                 />
//               </div>
//             )}

//             {/* Class Filter */}
//             <select
//               value={selectedClass}
//               onChange={(e) => setSelectedClass(e.target.value)}
//               className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white text-gray-800"
//             >
//               <option value="">All Classes</option>
//               {classOptions.map((cName) => (
//                 <option key={cName} value={cName}>
//                   {cName}
//                 </option>
//               ))}
//             </select>

//             {/* Clear Filters Button */}
//             {(searchStudent || selectedClass) && (
//               <button
//                 onClick={() => {
//                   setSearchStudent('');
//                   setSelectedClass('');
//                 }}
//                 className="text-xs text-red-600 hover:underline font-medium"
//               >
//                 Reset Filters
//               </button>
//             )}
//           </div>

//           {/* Record counter indicator */}
//           <span className="text-xs text-gray-500 font-medium">
//             Showing {activeDataset.length} {activeDataset.length === 1 ? 'record' : 'records'}
//           </span>
//         </div>

//         {detailsLoading ? (
//           <div className="p-8 text-center text-gray-500 text-sm">Loading detailed records...</div>
//         ) : (
//           <div>
//             <div className="overflow-x-auto">
//               {/* 1. All Assignments Table */}
//               {activeTab === 'assignments' && (
//                 <table className="w-full text-left text-sm text-gray-600">
//                   <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
//                     <tr>
//                       <th className="px-6 py-3">Assignment Title</th>
//                       <th className="px-6 py-3">Subject</th>
//                       <th className="px-6 py-3">Class</th>
//                       <th className="px-6 py-3">Deadline</th>
//                       <th className="px-6 py-3">Max Marks</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {paginatedData.length === 0 ? (
//                       <tr>
//                         <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
//                           No assignments found matching criteria.
//                         </td>
//                       </tr>
//                     ) : (
//                       (paginatedData as AssignmentDetail[]).map((item) => (
//                         <tr key={item.id} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 font-semibold text-gray-900">{item.title}</td>
//                           <td className="px-6 py-4">{item.subjectName || 'General'}</td>
//                           <td className="px-6 py-4">{item.className || 'General'}</td>
//                           <td className="px-6 py-4">{item.deadline ? new Date(item.deadline).toLocaleString() : 'N/A'}</td>
//                           <td className="px-6 py-4 font-medium text-gray-800">{item.maxMarks}</td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               )}

//               {/* 2. All Submissions Table */}
//               {activeTab === 'submissions' && (
//                 <table className="w-full text-left text-sm text-gray-600">
//                   <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
//                     <tr>
//                       <th className="px-6 py-3">Assignment Title</th>
//                       <th className="px-6 py-3">Student Name</th>
//                       <th className="px-6 py-3">Submitted At</th>
//                       <th className="px-6 py-3">Status</th>
//                       <th className="px-6 py-3">Marks</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {paginatedData.length === 0 ? (
//                       <tr>
//                         <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
//                           No submissions found matching criteria.
//                         </td>
//                       </tr>
//                     ) : (
//                       (paginatedData as SubmissionDetail[]).map((item) => {
//                         const isGraded = (item.status || '').toLowerCase() === 'graded';
//                         return (
//                           <tr key={item.id} className="hover:bg-gray-50">
//                             <td className="px-6 py-4 font-semibold text-gray-900">{item.assignmentTitle}</td>
//                             <td className="px-6 py-4">{item.studentName || 'Student'}</td>
//                             <td className="px-6 py-4">{item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'N/A'}</td>
//                             <td className="px-6 py-4">
//                               {isGraded ? (
//                                 <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
//                                   Graded
//                                 </span>
//                               ) : (
//                                 <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
//                                   Submitted
//                                 </span>
//                               )}
//                             </td>
//                             <td className="px-6 py-4 font-medium text-gray-800">
//                               {isGraded ? item.marks ?? '0' : 'Pending'}
//                             </td>
//                           </tr>
//                         );
//                       })
//                     )}
//                   </tbody>
//                 </table>
//               )}

//               {/* 3. Pending Grading Table */}
//               {activeTab === 'pending' && (
//                 <table className="w-full text-left text-sm text-gray-600">
//                   <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
//                     <tr>
//                       <th className="px-6 py-3">Assignment Title</th>
//                       <th className="px-6 py-3">Student Name</th>
//                       <th className="px-6 py-3">Submitted At</th>
//                       <th className="px-6 py-3">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {paginatedData.length === 0 ? (
//                       <tr>
//                         <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
//                           No pending submissions matching criteria.
//                         </td>
//                       </tr>
//                     ) : (
//                       (paginatedData as SubmissionDetail[]).map((item) => (
//                         <tr key={item.id} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 font-semibold text-gray-900">{item.assignmentTitle}</td>
//                           <td className="px-6 py-4">{item.studentName || 'Student'}</td>
//                           <td className="px-6 py-4">{item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'N/A'}</td>
//                           <td className="px-6 py-4">
//                             <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
//                               Pending Grading
//                             </span>
//                           </td>
//                         </tr>
//                       ))
//                     )}
//                   </tbody>
//                 </table>
//               )}
//             </div>

//             {/* Pagination Controls Footer */}
//             {activeDataset.length > 0 && (
//               <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
//                 <span className="text-xs text-gray-600">
//                   Page <span className="font-semibold">{currentPage}</span> of{' '}
//                   <span className="font-semibold">{totalPages}</span>
//                 </span>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                     disabled={currentPage === 1}
//                     className="px-3 py-1 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Previous
//                   </button>
//                   <button
//                     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                     disabled={currentPage === totalPages}
//                     className="px-3 py-1 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
// <br/>
//       {/* Quick Navigation Modules */}
//       <div className="space-y-4">
//         <h2 className="text-xl font-bold text-red-600">Management Modules</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//           {adminModules.map((module) => (
//             <Link
//               key={module.href}
//               href={module.href}
//               className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex flex-col justify-between group"
//             >
//               <div>
//                 <div className="flex items-center gap-3">
//                   <div className={`w-3 h-3 rounded-full ${module.iconColor}`} />
//                   <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
//                     {module.title}
//                   </h3>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-2 leading-relaxed">
//                   {module.description}
//                 </p>
//               </div>
//               <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-blue-600">
//                 <span>Access Module</span>
//                 <span className="group-hover:translate-x-1 transition-transform">→</span>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }





'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import api from '@/services/api';

interface DashboardStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalSubjects: number;
  totalAssignments: number;
  totalSubmissions: number;
  pendingGrading: number;
}

interface AssignmentDetail {
  id?: string;
  Id?: string;
  title?: string;
  Title?: string;
  subjectName?: string;
  SubjectName?: string;
  className?: string;
  ClassName?: string;
  teacherName?: string;
  TeacherName?: string;
  deadline?: string;
  Deadline?: string;
  maxMarks?: number;
  MaxMarks?: number;
}

interface SubmissionDetail {
  id?: string;
  Id?: string;
  assignmentId?: string;
  AssignmentId?: string;
  assignmentTitle?: string;
  AssignmentTitle?: string;
  studentName?: string;
  StudentName?: string;
  submittedAt?: string;
  SubmittedAt?: string;
  status?: string;
  Status?: string;
  marks?: number;
  Marks?: number;
  className?: string;
  ClassName?: string;
  class?: string;
  Class?: string;
  grade?: string;
  Grade?: string;
  assignment?: any;
  Assignment?: any;
  student?: any;
  Student?: any;
}

const ITEMS_PER_PAGE = 5;

const adminModules = [
  {
    title: 'User Management',
    description: 'Create, update, and manage student, teacher, and admin accounts.',
    href: '/admin/users',
    iconColor: 'bg-blue-600',
  },
  {
    title: 'Class & Section',
    description: 'Setup classes, manage sections, and organize academic structures.',
    href: '/admin/classes',
    iconColor: 'bg-emerald-600',
  },
  {
    title: 'Subject & Curriculum',
    description: 'Define academic subjects, course material, and syllabi.',
    href: '/admin/subjects',
    iconColor: 'bg-rose-600',
  },
  {
    title: 'Assign Teacher',
    description: 'Assign faculty members to specific subjects and classes.',
    href: '/admin/assign-teacher',
    iconColor: 'bg-amber-600',
  },
  {
    title: 'Global Settings',
    description: 'Configure system-wide portal preferences and configurations.',
    href: '/admin/settings',
    iconColor: 'bg-purple-600',
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
    pendingGrading: 0,
  });
  const [loading, setLoading] = useState(true);

  // Tabs state: 'assignments' | 'submissions' | 'pending'
  const [activeTab, setActiveTab] = useState<'assignments' | 'submissions' | 'pending'>('assignments');
  const [assignmentsList, setAssignmentsList] = useState<AssignmentDetail[]>([]);
  const [submissionsList, setSubmissionsList] = useState<SubmissionDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Filter States
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchStatsAndDetails();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchStudent, selectedClass]);

  const fetchStatsAndDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/dashboard-stats?t=${Date.now()}`);
      const data = response.data?.data || response.data;

      setStats({
        totalUsers: data.totalUsers ?? data.TotalUsers ?? 0,
        totalTeachers: data.totalTeachers ?? data.TotalTeachers ?? 0,
        totalStudents: data.totalStudents ?? data.TotalStudents ?? 0,
        totalClasses: data.totalClasses ?? data.TotalClasses ?? 0,
        totalSubjects: data.totalSubjects ?? data.TotalSubjects ?? 0,
        totalAssignments: data.totalAssignments ?? data.TotalAssignments ?? 0,
        totalSubmissions: data.totalSubmissions ?? data.TotalSubmissions ?? 0,
        pendingGrading: data.pendingGrading ?? data.PendingGrading ?? 0,
      });

      fetchDetailedData();
    } catch (error: any) {
      console.error('Failed to load dashboard metrics:', error.response?.status || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedData = async () => {
    setDetailsLoading(true);
    try {
      const assignRes = await api.get(`/admin/assignments?t=${Date.now()}`);
      setAssignmentsList(assignRes.data?.data || assignRes.data || []);

      const subRes = await api.get(`/admin/submissions?t=${Date.now()}`);
      setSubmissionsList(subRes.data?.data || subRes.data || []);
    } catch (err) {
      console.error('Failed to load detailed record data:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Helper to format class strings uniformly (e.g. "Grade 10" -> "Class 10", "class 7" -> "Class 7")
  const formatClassName = (name: string): string => {
    if (!name) return '';
    let cleaned = name.trim();
    if (/^grade/i.test(cleaned)) {
      cleaned = cleaned.replace(/^grade/i, 'Class');
    } else if (/^class/i.test(cleaned)) {
      cleaned = cleaned.replace(/^class/i, 'Class');
    }
    return cleaned;
  };

  // Safe helper to extract Class Name from Assignment records
  const getAssignmentClassName = (item: AssignmentDetail): string => {
    if (!item) return '';
    const rawClass = item.className || item.ClassName || '';
    return formatClassName(rawClass);
  };

  // Robust helper to extract Class Name from Submission records (with Assignment Fallback)
  const getSubmissionClassName = (item: SubmissionDetail): string => {
    if (!item) return '';

    const directClass =
      item.className ||
      item.ClassName ||
      item.class ||
      item.Class ||
      item.grade ||
      item.Grade ||
      item.assignment?.className ||
      item.assignment?.ClassName ||
      item.Assignment?.ClassName ||
      item.Assignment?.className ||
      item.student?.className ||
      item.Student?.ClassName;

    if (directClass) return formatClassName(String(directClass));

    // Fallback: Lookup matching assignment from assignmentsList
    const subTitle = item.assignmentTitle || item.AssignmentTitle || '';
    const subAssignId = item.assignmentId || item.AssignmentId || '';

    const matchingAssignment = assignmentsList.find((a) => {
      const aId = a.id || a.Id || '';
      const aTitle = a.title || a.Title || '';
      if (subAssignId && aId && subAssignId === aId) return true;
      if (subTitle && aTitle && subTitle.toLowerCase() === aTitle.toLowerCase()) return true;
      return false;
    });

    return matchingAssignment ? getAssignmentClassName(matchingAssignment) : '';
  };

  // Derive unique formatted classes from data dynamically for filter options
  const classOptions = useMemo(() => {
    const classes = new Set<string>();

    assignmentsList.forEach((a) => {
      const cName = getAssignmentClassName(a);
      if (cName) classes.add(cName);
    });

    submissionsList.forEach((s) => {
      const cName = getSubmissionClassName(s);
      if (cName) classes.add(cName);
    });

    return Array.from(classes).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [assignmentsList, submissionsList]);

  // Tab 1: Assignments Filtering
  const filteredAssignments = useMemo(() => {
    return assignmentsList.filter((item) => {
      const itemClass = getAssignmentClassName(item);
      return selectedClass ? itemClass.toLowerCase() === selectedClass.toLowerCase() : true;
    });
  }, [assignmentsList, selectedClass]);

  // Tab 2: Submissions Filtering
  const filteredSubmissions = useMemo(() => {
    return submissionsList.filter((item) => {
      const studentName = item.studentName || item.StudentName || '';
      const matchStudent = searchStudent
        ? studentName.toLowerCase().includes(searchStudent.toLowerCase())
        : true;

      const submissionClass = getSubmissionClassName(item);
      const matchClass = selectedClass
        ? submissionClass.toLowerCase() === selectedClass.toLowerCase()
        : true;

      return matchStudent && matchClass;
    });
  }, [submissionsList, searchStudent, selectedClass, assignmentsList]);

  // Tab 3: Pending Grading Filtering
  const filteredPendingSubmissions = useMemo(() => {
    return submissionsList.filter((item) => {
      const status = item.status || item.Status || '';
      const isNotGraded = status.toLowerCase() !== 'graded';

      const studentName = item.studentName || item.StudentName || '';
      const matchStudent = searchStudent
        ? studentName.toLowerCase().includes(searchStudent.toLowerCase())
        : true;

      const submissionClass = getSubmissionClassName(item);
      const matchClass = selectedClass
        ? submissionClass.toLowerCase() === selectedClass.toLowerCase()
        : true;

      return isNotGraded && matchStudent && matchClass;
    });
  }, [submissionsList, searchStudent, selectedClass, assignmentsList]);

  const activeDataset = useMemo(() => {
    if (activeTab === 'assignments') return filteredAssignments;
    if (activeTab === 'submissions') return filteredSubmissions;
    return filteredPendingSubmissions;
  }, [activeTab, filteredAssignments, filteredSubmissions, filteredPendingSubmissions]);

  const totalPages = Math.ceil(activeDataset.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return activeDataset.slice(start, start + ITEMS_PER_PAGE);
  }, [activeDataset, currentPage]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Dashboard Metrics...</div>;
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, color: 'bg-blue-500' },
    { title: 'Total Teachers', value: stats.totalTeachers, color: 'bg-emerald-500' },
    { title: 'Total Students', value: stats.totalStudents, color: 'bg-indigo-500' },
    { title: 'Total Classes', value: stats.totalClasses, color: 'bg-amber-500' },
    { title: 'Total Subjects', value: stats.totalSubjects, color: 'bg-rose-500' },
    { title: 'Total Assignments', value: stats.totalAssignments, color: 'bg-purple-500' },
    { title: 'Total Submissions', value: stats.totalSubmissions, color: 'bg-teal-500' },
    { title: 'Pending Grading', value: stats.pendingGrading, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform metrics overview and system controls</p>
      </div>

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
      <br/>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-lg font-bold text-violet-800">Academic Overview Details</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'assignments'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Assignments ({stats.totalAssignments})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'submissions'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Submissions ({stats.totalSubmissions})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'pending'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pending Grading ({stats.pendingGrading})
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50/50 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            {activeTab !== 'assignments' && (
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full sm:w-64 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white text-gray-800"
                />
              </div>
            )}

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white text-gray-800"
            >
              <option value="">All Classes</option>
              {classOptions.map((cName) => (
                <option key={cName} value={cName}>
                  {cName}
                </option>
              ))}
            </select>

            {(searchStudent || selectedClass) && (
              <button
                onClick={() => {
                  setSearchStudent('');
                  setSelectedClass('');
                }}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>

          <span className="text-xs text-gray-500 font-medium">
            Showing {activeDataset.length} {activeDataset.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {detailsLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading detailed records...</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              {activeTab === 'assignments' && (
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
                    <tr>
                      <th className="px-6 py-3">Assignment Title</th>
                      <th className="px-6 py-3">Subject</th>
                      <th className="px-6 py-3">Class</th>
                      <th className="px-6 py-3">Deadline</th>
                      <th className="px-6 py-3">Max Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          No assignments found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      (paginatedData as AssignmentDetail[]).map((item, idx) => (
                        <tr key={item.id || item.Id || idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">{item.title || item.Title}</td>
                          <td className="px-6 py-4">{item.subjectName || item.SubjectName || 'General'}</td>
                          <td className="px-6 py-4 font-medium text-gray-700">{getAssignmentClassName(item) || 'General'}</td>
                          <td className="px-6 py-4">
                            {item.deadline || item.Deadline ? new Date(item.deadline || item.Deadline!).toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-800">{item.maxMarks ?? item.MaxMarks ?? 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'submissions' && (
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
                    <tr>
                      <th className="px-6 py-3">Assignment Title</th>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3">Class</th>
                      <th className="px-6 py-3">Submitted At</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                          No submissions found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      (paginatedData as SubmissionDetail[]).map((item, idx) => {
                        const statusStr = item.status || item.Status || '';
                        const isGraded = statusStr.toLowerCase() === 'graded';
                        const displayClass = getSubmissionClassName(item);
                        const subAt = item.submittedAt || item.SubmittedAt;

                        return (
                          <tr key={item.id || item.Id || idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-gray-900">{item.assignmentTitle || item.AssignmentTitle}</td>
                            <td className="px-6 py-4">{item.studentName || item.StudentName || 'Student'}</td>
                            <td className="px-6 py-4 font-medium text-gray-700">{displayClass || 'General'}</td>
                            <td className="px-6 py-4">{subAt ? new Date(subAt).toLocaleString() : 'N/A'}</td>
                            <td className="px-6 py-4">
                              {isGraded ? (
                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                  Graded
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                                  Submitted
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-800">
                              {isGraded ? item.marks ?? item.Marks ?? '0' : 'Pending'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'pending' && (
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b">
                    <tr>
                      <th className="px-6 py-3">Assignment Title</th>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3">Class</th>
                      <th className="px-6 py-3">Submitted At</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                          No pending submissions matching criteria.
                        </td>
                      </tr>
                    ) : (
                      (paginatedData as SubmissionDetail[]).map((item, idx) => {
                        const displayClass = getSubmissionClassName(item);
                        const subAt = item.submittedAt || item.SubmittedAt;

                        return (
                          <tr key={item.id || item.Id || idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-semibold text-gray-900">{item.assignmentTitle || item.AssignmentTitle}</td>
                            <td className="px-6 py-4">{item.studentName || item.StudentName || 'Student'}</td>
                            <td className="px-6 py-4 font-medium text-gray-700">{displayClass || 'General'}</td>
                            <td className="px-6 py-4">{subAt ? new Date(subAt).toLocaleString() : 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                Pending Grading
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {activeDataset.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <br/>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-red-600">Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {adminModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${module.iconColor}`} />
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {module.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  {module.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-blue-600">
                <span>Access Module</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}