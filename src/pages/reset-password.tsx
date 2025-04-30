import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);

  // Validate token when component mounts
  useEffect(() => {
    async function validateToken() {
      if (!token) return;
      
      try {
        // Check if token exists in our database
        const { data, error } = await supabase
          .from('password_reset_tokens')
          .select('expires_at')
          .eq('token', token)
          .single();

        if (error || !data) {
          setError('Invalid or expired reset link');
          setTokenValid(false);
        } else {
          // Check if token is expired
          const now = new Date();
          const expiresAt = new Date(data.expires_at);
          
          if (now > expiresAt) {
            setError('This reset link has expired');
            setTokenValid(false);
          } else {
            setTokenValid(true);
          }
        }
      } catch (err) {
        console.error('Error validating token:', err);
        setError('An error occurred while validating your reset link');
        setTokenValid(false);
      } finally {
        setTokenChecked(true);
      }
    }

    if (token) {
      validateToken();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate password
      const result = passwordSchema.safeParse({ password, confirmPassword });
      
      if (!result.success) {
        setError(result.error.errors[0].message);
        return;
      }

      // Call our API to complete the password reset
      const response = await fetch('/api/auth/complete-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast.success('Password reset successful');
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.message || 'An error occurred while resetting your password');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
            <p className="mt-2 text-sm text-gray-600">Validating your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/forgot-password')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Request a new reset link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm New Password</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
