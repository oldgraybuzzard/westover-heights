import { loadStripe } from '@stripe/stripe-js';

// Since we only have live keys, we'll use them for all environments
// but we'll add a warning in development mode
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE;

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key');
}

// Log a warning in development mode
if (process.env.NODE_ENV !== 'production') {
  console.warn(
    '⚠️ WARNING: Using live Stripe keys in development environment. ' +
    'Any charges will be REAL. Use test cards like 4242 4242 4242 4242 for testing.'
  );
}

export const stripePromise = loadStripe(stripePublishableKey);
