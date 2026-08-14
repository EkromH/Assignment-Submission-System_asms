'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  const syncAuthState = () => {
    const storedRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    // Set normalized role string if token exists
    setRole(token ? (storedRole || 'Admin').toLowerCase() : null);
  };

  useEffect(() => {
    syncAuthState();
    window.addEventListener('authChange', syncAuthState);
    return () => {
      window.removeEventListener('authChange', syncAuthState);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('authChange'));
    router.push('/login');
  };

  // Determine home portal destination based on logged-in role
  const portalHome =
    role === 'student'
      ? '/student/dashboard'
      : role === 'teacher'
      ? '/teacher/dashboard'
      : '/admin/dashboard';

  return (
    <nav className="bg-[#0b132b] text-white h-16 flex items-center px-6 justify-between shadow-md">
      {/* Left: Brand Logo */}
      <div className="flex items-center gap-8">
      ASMS Portal
        {/* <Link href={portalHome} className="text-blue-400 font-bold text-lg hover:opacity-90">
          ASMS Portal
        </Link> */}
      </div>

      {/* Right: User Role Tag & Auth Action */}
      <div className="flex items-center gap-4">
        {/* {role && (
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 capitalize font-medium">
            {role}
          </span>
        )} */}

        {role ? (
          <button
            onClick={handleLogout}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded font-medium transition"
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded font-medium transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}