import { useEffect } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';

export default function CheckEmailPage() {
  // Add tracking for debugging
  useEffect(() => {
    console.log('Check email page loaded');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
            <FaEnvelope className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification link to your email address.
            Please check your inbox and click the link to verify your account.
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            After verifying your email, you'll need to log in with your credentials to access the forum.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important note</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    If clicking the link in your email doesn't work, please copy and paste the entire URL into your browser's address bar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-center">
            <p className="mb-4">Didn't receive an email? Check your spam folder or</p>
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              Return to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
