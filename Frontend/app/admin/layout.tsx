'use client';

import { useAuthGuard } from '@/app/hooks/useAuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard();
  return <>{children}</>;
}