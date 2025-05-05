import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { updateCanPost } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Import Stripe components dynamically to prevent SSR issues
const StripePaymentHandler = dynamic(
  () => import('@/components/StripePaymentHandler'),
  { ssr: false }
);

// Load Stripe outside of component to avoid recreating it on renders
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
      <Elements stripe={stripePromise}>
        <StripePaymentHandler 
          setStatus={setStatus} 
          setMessage={setMessage} 
          user={user} 
        />
      </Elements>

      {status === 'loading' && (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
          <p className="text-gray-600">{message || 'Please wait while we confirm your payment...'}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center py-8">
          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <Link href="/forum/new" className="block w-full py-2 px-4 bg-green-100 text-green-800 hover:bg-green-200 font-bold rounded-md shadow-sm hover:shadow transition-all duration-200 border border-green-300 text-center">
              Ask a Question
            </Link>
            <Link href="/forum" className="block w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md text-center hover:bg-gray-200">
              Go to Forum
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <button 
              onClick={() => router.back()} 
              className="block w-full py-2 px-4 bg-green-100 text-green-800 hover:bg-green-200 font-bold rounded-md shadow-sm hover:shadow transition-all duration-200 border border-green-300 text-center"
            >
              Try Again
            </button>
            <Link href="/contact" className="block w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md text-center hover:bg-gray-200">
              Contact Support
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
