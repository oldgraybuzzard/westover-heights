import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FaSpinner, FaLock } from 'react-icons/fa';
import { Dialog } from '@headlessui/react';

// Use our configured Stripe promise
import { stripePromise } from '@/lib/stripe/client';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => void;
  mode?: 'new' | 'renewal';
}

function PaymentForm({ onSuccess, onClose, mode = 'new' }: Omit<PaymentModalProps, 'isOpen'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isTestEnvironment, setIsTestEnvironment] = useState(false);

  useEffect(() => {
    async function createPaymentIntent() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: 2500 }), // $25.00
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create payment intent');
        }

        const { clientSecret, id, isTestEnvironment } = await response.json();
        console.log('Payment intent created with ID:', id);
        setClientSecret(clientSecret);
        setPaymentIntentId(id);
        setIsTestEnvironment(isTestEnvironment);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setLoading(false);
      }
    }

    createPaymentIntent();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw confirmError;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded:', paymentIntent.id);
        onSuccess(paymentIntent.id);
      } else if (paymentIntent) {
        // Handle other statuses
        console.log('Payment status:', paymentIntent.status);
        if (paymentIntent.status === 'requires_action') {
          // Let Stripe handle the rest with redirect
          console.log('Payment requires additional action');
        } else {
          throw new Error(`Payment failed with status: ${paymentIntent.status}`);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret && !error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center">
        <FaSpinner className="animate-spin text-primary text-2xl mb-4" />
        <p>Initializing payment...</p>
      </div>
    );
  }

  if (error && !clientSecret) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Payment initialization failed</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {isTestEnvironment && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          <p className="font-medium">⚠️ Test Mode</p>
          <p className="text-sm">
            This is a development environment using live Stripe keys. To avoid real charges, use test card 
            <span className="font-mono bg-yellow-100 px-1 mx-1">4242 4242 4242 4242</span>
            with any future expiration date and any CVC.
          </p>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {mode === 'new' ? 'Post a Question' : 'Renew Posting Ability'}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {mode === 'new'
            ? 'Your payment of $25 allows you to post 1 question and 2 follow-up questions.'
            : 'Your payment of $25 renews your ability to post 3 more questions.'}
        </p>
        
        <div className="mb-6">
          <PaymentElement />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <FaLock className="mr-1" />
            <span>Secure payment</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-medium">$25.00</p>
            <p className="text-xs text-gray-500">USD</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || loading}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center"
        >
          {loading && <FaSpinner className="animate-spin mr-2" />}
          Pay $25.00
        </button>
      </div>
    </form>
  );
}

export default function PaymentModal({ isOpen, onClose, onSuccess, mode = 'new' }: PaymentModalProps) {
  const [options, setOptions] = useState({
    mode: 'payment' as const,
    amount: 2500,
    currency: 'usd',
    appearance: {
      theme: 'stripe' as const,
    },
  });

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white shadow-xl">
          <Elements stripe={stripePromise} options={options}>
            <PaymentForm onSuccess={onSuccess} onClose={onClose} mode={mode} />
          </Elements>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
