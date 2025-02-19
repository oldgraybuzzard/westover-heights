import { Dialog } from '@headlessui/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';
import { FaTimes } from 'react-icons/fa';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => Promise<void>;
  mode: 'renewal' | 'new';
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Create PaymentIntent as soon as the modal opens
      const createIntent = async () => {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 2500 }) // $25.00
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      };

      createIntent();
    }
  }, [isOpen]);

  if (!isOpen || !clientSecret) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />

        <div className="relative bg-white rounded-lg p-8 max-w-md w-full">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <FaTimes className="w-5 h-5" />
          </button>

          <Dialog.Title className="text-lg font-medium mb-4">
            Payment Required
          </Dialog.Title>

          <div className="mb-4 text-gray-600">
            <p>To post a question, a one-time payment of $25 is required.</p>
            <p className="mt-2 text-sm">
              This helps maintain the quality of our forum.
            </p>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
              amount={25}
              onPaymentSuccess={onSuccess}
              onPaymentError={(error) => console.error(error)}
            />
          </Elements>
        </div>
      </div>
    </Dialog>
  );
}
