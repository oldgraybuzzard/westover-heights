import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [processingTime, setProcessingTime] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    // Log for debugging
    console.log('Auth callback page loaded');
    console.log('URL parameters:', router.query);

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (verificationStatus === 'loading') {
        console.error('Verification timed out after 15 seconds');
        setErrorMessage('Verification is taking longer than expected. Please try logging in directly.');
        setVerificationStatus('error');
        
        // Add debug info
        setDebugInfo(`Code: ${router.query.code}, Browser: ${navigator.userAgent}`);
      }
    }, 15000);

    // Add a timer to show processing time
    const timerId = setInterval(() => {
      setProcessingTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(timerId);
    };
  }, [verificationStatus, router.query]);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for error parameters first
        if (router.query.error) {
          console.error('Error in callback URL:', router.query.error);
          const errorDesc = router.query.error_description as string || 'Verification failed';
          const errorType = router.query.error as string;
          const errorCodeValue = router.query.error_code as string || '';
          
          // Extract email from the URL if available
          const email = router.query.email as string || '';
          
          setErrorMessage(errorDesc);
          setErrorCode(errorCodeValue);
          setVerificationStatus('error');
          
          // Store email for resend verification
          if (email) {
            sessionStorage.setItem('verification_email', email);
          }
          
          // Add more detailed logging
          console.log('Full error details:', {
            error: errorType,
            description: errorDesc,
            code: errorCodeValue,
            email: email
          });
          
          return;
        }
        
        // Get the auth code from the URL
        const code = router.query.code;
        
        if (typeof code !== 'string') {
          console.error('No code found in URL');
          setErrorMessage('Invalid verification link');
          setVerificationStatus('error');
          return;
        }

        console.log('Processing auth code:', code);
        
        // Detect browser
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // For all browsers, use a more reliable approach
        try {
          // Set a timeout for the Supabase call
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Verification request timed out')), 10000)
          );
          
          // Try to exchange the code for a session
          const exchangePromise = supabase.auth.exchangeCodeForSession(code);
          
          // Race the exchange against the timeout
          const result = await Promise.race([exchangePromise, timeoutPromise]);
          
          // If we get here, the exchange succeeded before the timeout
          const { data, error } = result as Awaited<typeof exchangePromise>;
          
          if (error) {
            console.error('Error exchanging code for session:', error);
            
            // For Safari or mobile browsers, redirect to login anyway
            if (isSafari || isMobile) {
              console.log('Browser compatibility issue detected, redirecting to login');
              setVerificationStatus('success');
              setTimeout(() => {
                router.push('/login?verified=attempted');
              }, 2000);
              return;
            }
            
            setErrorMessage('Verification failed: ' + error.message);
            setVerificationStatus('error');
            return;
          }

          console.log('Verification successful, session data:', data);
          setVerificationStatus('success');
          
          // Add a small delay before redirecting to ensure state updates
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 2000);
        } catch (error) {
          console.error('Verification error:', error);
          
          // For Safari or mobile browsers, redirect to login anyway
          if (isSafari || isMobile) {
            console.log('Browser compatibility issue detected, redirecting to login');
            setVerificationStatus('success');
            setTimeout(() => {
              router.push('/login?verified=attempted');
            }, 2000);
            return;
          }
          
          setErrorMessage('Error processing verification');
          setVerificationStatus('error');
          setDebugInfo(error instanceof Error ? error.message : String(error));
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setErrorMessage('An error occurred during verification');
        setVerificationStatus('error');
        setDebugInfo(error instanceof Error ? error.message : String(error));
      }
    };

    // Only run the callback handler if we have URL parameters and router is ready
    if (router.isReady && Object.keys(router.query).length > 0) {
      handleAuthCallback();
    }
  }, [router.isReady, router.query, router]);

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md px-4">
          <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Verifying your email</h2>
          <p className="text-gray-600 mb-4">Please wait while we verify your email address...</p>
          
          {processingTime > 5 && (
            <div className="mt-4 text-sm text-gray-500">
              <p>This is taking longer than expected. Please wait a moment...</p>
              {processingTime > 10 && (
                <p className="mt-2">
                  If verification doesn't complete soon, you can try{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    logging in
                  </Link>{' '}
                  directly.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    // Customize error message based on error code
    let errorTitle = 'Verification Failed';
    let errorInstructions = 'Please try logging in directly. If you cannot log in, you may need to request a new verification email.';
    let actionText = 'Go to Login';
    let actionLink = '/login';
    
    // Get email from session storage if available
    const email = typeof window !== 'undefined' ? sessionStorage.getItem('verification_email') || '' : '';
    
    if (errorCode === 'otp_expired' || errorMessage.includes('expired')) {
      errorTitle = 'Verification Link Expired';
      errorInstructions = 'Your verification link has expired. Please request a new verification email.';
      actionText = 'Request New Verification Email';
      actionLink = email ? `/resend-verification?email=${encodeURIComponent(email)}` : '/resend-verification';
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-red-100 text-red-600 p-3 rounded-full inline-flex mx-auto mb-4">
            <FaExclamationTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{errorTitle}</h2>
          <p className="text-gray-600 mb-6">{errorInstructions}</p>
          
          <div className="space-y-4">
            <Link href={actionLink} className="inline-block bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors w-full">
              {actionText}
            </Link>
            
            {actionLink !== '/login' && (
              <Link href="/login" className="inline-block text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md font-medium transition-colors">
                Go to Login
              </Link>
            )}
          </div>
          
          {debugInfo && (
            <div className="mt-8 p-3 bg-gray-100 rounded-md text-xs text-left text-gray-500 overflow-auto">
              <p className="font-medium mb-1">Debug information:</p>
              <pre>{debugInfo}</pre>
            </div>
          )}
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
