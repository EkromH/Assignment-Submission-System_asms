'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (role === 'Admin') router.push('/admin/dashboard');
      else if (role === 'Teacher') router.push('/teacher/dashboard');
      else if (role === 'Student') router.push('/student/dashboard');
      else router.push('/login');
    } catch {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-gray-600 font-medium">Redirecting to your dashboard...</div>
    </div>
  );
}