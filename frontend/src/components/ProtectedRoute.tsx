'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      if (requiredRole === 'ADMIN' && user?.role !== 'ADMIN') {
        router.push('/');
      } else if (requiredRole === 'BUSINESS_OWNER' && user?.role !== 'BUSINESS_OWNER') {
        router.push('/');
      }
    }
  }, [hasHydrated, isAuthenticated, user, requiredRole, router]);

  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
