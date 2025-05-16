import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { updateCanPost } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { stripePromise } from '@/lib/stripe/client';

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your payment...');
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!router.isReady) return;
    
    const verifyPayment = async () => {
      try {
        if (!user) {
          console.log('No user found, waiting for authentication...');
          // Wait a bit for auth to initialize before failing
          setTimeout(() => {
            if (!user) {
              setStatus('error');
              setMessage('User session not found. Please log in again.');
            }
          }, 3000);
          return;
        }

        // Get the payment_intent and payment_intent_client_secret from URL
        const { payment_intent, payment_intent_client_secret } = router.query;

        if (!payment_intent) {
          setStatus('error');
          setMessage('No payment information found in URL.');
          return;
        }

        // Load Stripe
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }

        // Retrieve the payment intent to check its status
        const { paymentIntent, error } = await stripe.retrievePaymentIntent(
          payment_intent_client_secret as string
        );

        if (error) {
          console.error('Error retrieving payment intent:', error);
          throw error;
        }

        if (!paymentIntent) {
          throw new Error('Payment information could not be retrieved');
        }

        // Check payment status
        switch (paymentIntent.status) {
          case 'succeeded':
            try {
              console.log('Updating user permissions for user ID:', user.id);
              // Update user's posting ability
              await updateCanPost(user.id, paymentIntent.id);
              setStatus('success');
              setMessage('Payment successful! You can now post questions.');
              
              // Show success toast
              toast.success('Payment successful!');
            } catch (error) {
              console.error('Error updating user permissions:', error);
              setStatus('error');
              setMessage('Payment successful, but there was an error updating your account. Please contact support.');
              
              // Show error toast
              toast.error('Error updating account. Please contact support.');
            }
            break;
            
          case 'processing':
            setStatus('loading');
            setMessage('Your payment is still processing. We\'ll update your account once the payment is complete.');
            break;
            
          case 'requires_payment_method':
            setStatus('error');
            setMessage('Payment failed. Please try again with a different payment method.');
            break;
            
          default:
            setStatus('error');
            setMessage(`Unexpected payment status: ${paymentIntent.status}`);
            break;
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'An error occurred while processing your payment');
      }
    };

    verifyPayment();
  }, [router.isReady, router.query, user]);

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md">
      {status === 'loading' && (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
          <p className="text-gray-600">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center py-8">
          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <Link href="/forum/new" className="block w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
              Post a Question
            </Link>
            <Link href="/forum" className="block w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Browse Forum
            </Link>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center py-8">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Issue</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <Link href="/forum/new" className="block w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
              Try Again
            </Link>
            <Link href="/support" className="block w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
