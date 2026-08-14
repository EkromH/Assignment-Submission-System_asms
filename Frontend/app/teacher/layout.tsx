'use client';

import { useAuthGuard } from '@/app/hooks/useAuthGuard';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard();
  return <>{children}</>;
}