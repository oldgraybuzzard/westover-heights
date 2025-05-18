import { loadStripe } from '@stripe/stripe-js';
import { TEST_CARDS } from './testCards';

// Determine if we're in a development environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// Choose the appropriate key based on environment
const stripePublishableKey = isDevelopment
  ? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY // Test key for development
  : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE; // Live key for production

// Fallback for build time or missing keys
const finalPublishableKey = 
  stripePublishableKey || 
  // During build time, return a placeholder that will be replaced at runtime
  (typeof window === 'undefined' ? 'pk_placeholder_for_build' : '');

// Only throw an error at runtime, not during build
if (typeof window !== 'undefined' && !finalPublishableKey) {
  throw new Error('Missing Stripe publishable key');
}

// Log a warning in development mode if using live keys
if (isDevelopment && finalPublishableKey?.startsWith('pk_live_')) {
  console.warn(
    '⚠️ WARNING: Using live Stripe keys in development environment. ' +
    'Any charges will be REAL. Use test cards like ' + TEST_CARDS.success + ' for testing.'
  );
}

// Initialize Stripe only in browser environment
let stripePromise: ReturnType<typeof loadStripe> | null = null;

if (typeof window !== 'undefined' && finalPublishableKey !== 'pk_placeholder_for_build' && finalPublishableKey !== '') {
  stripePromise = loadStripe(finalPublishableKey);
}

// Export environment info for components to use
export const isTestMode = isDevelopment || finalPublishableKey?.startsWith('pk_test_');
export { stripePromise };
