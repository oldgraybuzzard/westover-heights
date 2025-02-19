import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!stripe || !elements) {
      onPaymentError(new Error('Payment system not initialized'));
      return;
    }

    setProcessing(true);

    try {
      if (!user) {
        onPaymentError(new Error('User not authenticated'));
        return;
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      if (paymentIntent) {
        console.log('Payment intent created:', paymentIntent);
        await onPaymentSuccess(paymentIntent.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onPaymentError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        disabled={!stripe || processing}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  );
}