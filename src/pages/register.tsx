import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import { useRouter } from 'next/router';

const RegisterPage: React.FC = () => {
  const { register, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user) {
      router.push('/questions');
    }
  }, [user, router]);

  return <AuthForm type="register" onSubmit={register} />;
};

export default RegisterPage; 