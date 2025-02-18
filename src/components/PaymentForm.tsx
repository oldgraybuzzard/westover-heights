import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

interface PaymentFormProps {
  amount: number;
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  onPaymentError: (error: string) => void;
}

export default function PaymentForm({ amount, onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canPost, setCanPost] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(true);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Please sign in to continue');
      }

      const response = await fetch(`${window.location.origin}/api/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          sessionId: session.access_token,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment failed');
      }

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        throw result.error;
      }

      // Create payment history record
      const { error: historyError } = await supabase
        .from('payment_history')
        .insert({
          user_id: session.user.id,
          payment_intent_id: result.paymentIntent?.id,
          amount: 2500,
          posts_remaining: 3,
          status: 'active'
        });

      if (historyError) throw historyError;

      await supabase.rpc('grant_posting_permission', {
        session_id: session.access_token
      });

      if (result.paymentIntent) {
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          await supabase.rpc('grant_posting_permission', {
            session_id: session.access_token
          });
          setCanPost(true);
          setShowPaymentModal(false);
          toast.success('You can now post your question!');
          onPaymentSuccess(result.paymentIntent.id);
        }
      }

      toast.success('Payment successful! You can now post questions.');
    } catch (error) {
      console.error('Payment failed:', error);
      setError(error instanceof Error ? error.message : 'Payment failed');
      toast.error(error instanceof Error ? error.message : 'Payment failed');
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
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
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Pay $25 to Post'}
      </button>
    </form>
  );
}