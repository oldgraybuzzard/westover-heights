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
  const { token: urlToken, devMode } = router.query;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [token, setToken] = useState<string | undefined>(urlToken as string | undefined);

  useEffect(() => {
    // Set token from URL parameter and log for debugging
    if (urlToken && typeof urlToken === 'string') {
      console.log('Token received from URL:', urlToken);
      setToken(urlToken);
    } else {
      console.log('No token found in URL parameters');
    }
    
    // Handle development mode
    if (devMode === 'true') {
      console.log('[DEV MODE] Simulating valid token');
      setTokenValid(true);
      setTokenChecked(true);
      // Generate a fake token for development testing
      if (!urlToken) {
        const fakeToken = 'dev-' + Math.random().toString(36).substring(2, 15);
        setToken(fakeToken);
      }
      return;
    }

    // Only proceed with validation if we have a token
    if (!token) {
      console.log('No token available for validation');
      setTokenChecked(true);
      return;
    }

    async function validateToken() {
      console.log('Validating token:', token);
      
      try {
        // Make a request to our API to validate the token
        const response = await fetch('/api/auth/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('Token validation failed:', data.error);
          setError(data.error || 'Invalid or expired reset link');
          setTokenValid(false);
        } else {
          console.log('Token is valid');
          setTokenValid(true);
        }
      } catch (err) {
        console.error('Error validating token:', err);
        setError('An error occurred while validating your reset link');
        setTokenValid(false);
      } finally {
        setTokenChecked(true);
      }
    }

    validateToken();
  }, [token, devMode, urlToken]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate password
      const result = passwordSchema.safeParse({ password, confirmPassword });
      
      if (!result.success) {
        setError(result.error.errors[0].message);
        setLoading(false);
        return;
      }

      // Check if we're in development mode
      if (router.query.devMode === 'true') {
        console.log('[DEV MODE] Would reset password to:', password);
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success('Development mode: Password reset successful');
        
        // Redirect to login page
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        
        return;
      }

      console.log('Submitting password reset with token:', token);

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
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      console.error('Reset password error:', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred while resetting your password'
      );
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
