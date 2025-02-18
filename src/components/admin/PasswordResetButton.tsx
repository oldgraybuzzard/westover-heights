import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

interface PasswordResetButtonProps {
  userId: string;
  userEmail: string;
}

export default function PasswordResetButton({ userId, userEmail }: PasswordResetButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      toast.success('Password reset email sent');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
    >
      {loading ? 'Sending...' : 'Reset Password'}
    </button>
  );
}