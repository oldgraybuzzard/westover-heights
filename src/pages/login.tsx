import React from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import { useRouter } from 'next/router';

const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      router.push('/questions');
    }
  }, [user, router]);

  return <AuthForm type="login" onSubmit={login} />;
};

export default LoginPage; 