'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function AuthContent() {
  const auth = useAuth();

  return (
    <div>
      {auth.user ? (
        <div>Welcome, {auth.user.email}</div>
      ) : (
        <div>Welcome, Guest</div>
      )}
    </div>
  );
} 