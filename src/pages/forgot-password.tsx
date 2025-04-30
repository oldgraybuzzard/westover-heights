'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const isDevelopment = process.env.NODE_ENV === 'development';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the current origin, handling both production and development environments
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      if (isDevelopment) {
        // In development, simulate success without actually sending emails
        console.log(`[DEV MODE] Would send reset email to: ${email}`);
        console.log(`[DEV MODE] Redirect URL would be: ${origin}/reset-password`);
        
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Skip actual API call and simulate success
        setSent(true);
        toast.success('Development mode: Password reset link generated (check console)');
      } else {
        // In production, use the actual Supabase API
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/reset-password`,
          });

          if (error) throw error;
          setSent(true);
          toast.success('Password reset instructions sent to your email');
        } catch (error) {
          console.error('Password reset error:', error);
          
          // Check if it's an email sending error
          if (error instanceof Error && error.message.includes('sending recovery email')) {
            toast.error('Unable to send recovery email. Please try again later or contact support.');
          } else if (error instanceof Error && error.message.includes('User not found')) {
            // Don't reveal that the email doesn't exist (security best practice)
            setSent(true);
            toast.success('If your email exists in our system, you will receive reset instructions');
          } else {
            toast.error('An error occurred. Please try again later.');
          }
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Generic error message to avoid revealing too much information
      toast.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Check your email</h2>
          <p className="text-gray-600">
            We've sent password reset instructions to your email address.
          </p>
          {isDevelopment && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-700">
                <strong>Development Mode:</strong> No email was actually sent. 
                In a real environment, the user would receive an email with a reset link.
              </p>
              <Link
                href="/reset-password?devMode=true"
                className="mt-2 inline-block text-yellow-600 hover:text-yellow-800 font-medium"
              >
                Simulate clicking reset link
              </Link>
            </div>
          )}
          <Link
            href="/login"
            className="inline-block text-primary hover:text-primary/80"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
          {isDevelopment && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-xs text-yellow-700">
                <strong>Development Mode:</strong> Email functionality is simulated.
                No actual emails will be sent.
              </p>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Email address"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send reset instructions'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary/80"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 
