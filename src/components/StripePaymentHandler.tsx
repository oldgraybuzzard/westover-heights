import { useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { updateCanPost } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface StripePaymentHandlerProps {
  setStatus: (status: 'loading' | 'success' | 'error') => void;
  setMessage: (message: string) => void;
  user: User | null;
}

export default function StripePaymentHandler({ 
  setStatus, 
  setMessage, 
  user 
}: StripePaymentHandlerProps) {
  const stripe = useStripe();

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the payment intent from the URL
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      setStatus('error');
      setMessage('No payment information found.');
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(async ({ paymentIntent }) => {
      if (!paymentIntent) {
        setStatus('error');
        setMessage('Payment information could not be retrieved.');
        return;
      }

      switch (paymentIntent.status) {
        case 'succeeded':
          try {
            if (user) {
              await updateCanPost(user.id, paymentIntent.id);
              setStatus('success');
              setMessage('Payment successful! You can now post questions.');
            } else {
              setStatus('error');
              setMessage('Payment successful, but user session expired. Please log in again.');
            }
          } catch (error) {
            console.error('Error updating user permissions:', error);
            setStatus('error');
            setMessage('Payment successful, but there was an error updating your account. Please contact support.');
          }
          break;
        case 'processing':
          setStatus('loading');
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setStatus('error');
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setStatus('error');
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe, user, setStatus, setMessage]);

  return null;
}