import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

export const useProtectedRoute = (adminRequired: boolean = false) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (adminRequired && user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, adminRequired, router]);

  return { user, loading };
}; 