import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useAuth } from '@/contexts/AuthContext';
import { updateCanPost } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase/client';
import { isTestMode } from '@/lib/stripe/client';
import { TEST_CARDS } from '@/lib/stripe/testCards';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  onPaymentError: (error: Error) => void;
}

export default function PaymentForm({ amount, onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Log when Stripe and Elements are loaded
    if (stripe && elements) {
      console.log('Stripe and Elements loaded successfully');
    }
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Payment form submitted');
    setError(null);
    
    if (!stripe || !elements) {
      console.error('Stripe or Elements not loaded');
      onPaymentError(new Error('Payment system not initialized'));
      return;
    }

    if (!user) {
      console.error('User not authenticated');
      onPaymentError(new Error('User not authenticated'));
      return;
    }

    setProcessing(true);
    console.log('Processing payment...');

    try {
      // Ensure we have the latest user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Your session has expired. Please log in again.');
      }

      // Confirm the payment
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          payment_method_data: {
            billing_details: {
              email: user.email || undefined,
            }
          }
        },
        redirect: 'if_required'
      });

      console.log('Payment result:', result);

      if (result.error) {
        console.error('Payment error:', result.error);
        throw new Error(result.error.message || 'Payment failed');
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', result.paymentIntent.id);
        
        try {
          // Try to update user permissions immediately if payment succeeded without redirect
          await onPaymentSuccess(result.paymentIntent.id);
          toast.success('Payment successful!');
        } catch (err) {
          console.error('Error updating permissions:', err);
          // If updating permissions fails, redirect to success page to try again
          window.location.href = `${window.location.origin}/payment-success?payment_intent=${result.paymentIntent.id}&payment_intent_client_secret=${result.paymentIntent.client_secret}`;
        }
      } else if (result.paymentIntent) {
        console.log('Payment status:', result.paymentIntent.status);
        // Handle other payment statuses
        if (result.paymentIntent.status === 'requires_action') {
          toast('Additional authentication required. Please complete the verification.', {
            icon: 'ℹ️',
            style: {
              background: '#3498db',
              color: '#fff',
            },
          });
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onPaymentError(err instanceof Error ? err : new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {isTestMode && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          <p className="font-medium">⚠️ Test Mode</p>
          <p className="text-sm">
            This is a test environment. To test payments, use test card 
            <span className="font-mono bg-yellow-100 px-1 mx-1">{TEST_CARDS.success}</span>
            with any future expiration date and any CVC.
          </p>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="p-4 border rounded-md bg-gray-50">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  );
}
