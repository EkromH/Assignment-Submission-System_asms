'use client';

import { useEffect } from 'react';

export function useAuthGuard() {
  useEffect(() => {
    const checkAuthAndPreventCache = (event: PageTransitionEvent) => {
      const token = localStorage.getItem('token');

      // If no token exists or the page was restored from back/forward cache (bfcache)
      if (!token || event.persisted) {
        window.location.href = '/login';
      }
    };

    // Initial check on page load
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }

    // Handle Browser Back / Forward Cache restoration
    window.addEventListener('pageshow', checkAuthAndPreventCache);

    return () => {
      window.removeEventListener('pageshow', checkAuthAndPreventCache);
    };
  }, []);
}