import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Log for debugging
    console.log('Auth callback page loaded');
    console.log('URL parameters:', router.query);

    const handleAuthCallback = async () => {
      try {
        // Get the auth code from the URL
        const code = router.query.code;
        
        if (typeof code !== 'string') {
          console.error('No code found in URL');
          setErrorMessage('Invalid verification link');
          setVerificationStatus('error');
          return;
        }

        console.log('Processing auth code:', code);
        
        // Exchange the code for a session (this doesn't automatically log the user in)
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('Error exchanging code for session:', error);
          setErrorMessage('Verification failed: ' + error.message);
          setVerificationStatus('error');
          return;
        }

        console.log('Verification successful');
        setVerificationStatus('success');
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setErrorMessage('An error occurred during verification');
        setVerificationStatus('error');
      }
    };

    // Only run the callback handler if we have URL parameters
    if (router.isReady && Object.keys(router.query).length > 0) {
      handleAuthCallback();
    }
  }, [router.isReady, router.query, router]);

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Verifying your email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md px-4">
          <div className="bg-red-100 text-red-600 p-3 rounded-full inline-flex mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Link href="/login" className="inline-block bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="text-center max-w-md px-4">
        <div className="bg-green-100 text-green-600 p-3 rounded-full inline-flex mx-auto mb-4">
          <FaCheckCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Email Verified Successfully!</h2>
        <p className="text-gray-600 mb-6">Your email has been verified. You can now log in to your account.</p>
        <Link href="/login" className="inline-block bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
          Log In Now
        </Link>
      </div>
    </div>
  );
}
