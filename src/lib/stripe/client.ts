import { loadStripe } from '@stripe/stripe-js';

// Get the publishable key with fallback for build time
const stripePublishableKey = 
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE || 
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
  // During build time, return a placeholder that will be replaced at runtime
  (typeof window === 'undefined' ? 'pk_placeholder_for_build' : '');

// Only throw an error at runtime, not during build
if (typeof window !== 'undefined' && !stripePublishableKey) {
  throw new Error('Missing Stripe publishable key');
}

// Log a warning in development mode
if (process.env.NODE_ENV !== 'production') {
  console.warn(
    '⚠️ WARNING: Using live Stripe keys in development environment. ' +
    'Any charges will be REAL. Use test cards like 4242 4242 4242 4242 for testing.'
  );
}

// Initialize Stripe only in browser environment
let stripePromise: ReturnType<typeof loadStripe> | null = null;

if (typeof window !== 'undefined' && stripePublishableKey !== 'pk_placeholder_for_build' && stripePublishableKey !== '') {
  stripePromise = loadStripe(stripePublishableKey);
}

export { stripePromise };
