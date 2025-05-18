import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Determine if we're in a development environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// Choose the appropriate key based on environment
const stripeSecretKey = isDevelopment
  ? process.env.STRIPE_SECRET_KEY // Test key for development
  : process.env.STRIPE_SECRET_KEY_LIVE; // Live key for production

if (!stripeSecretKey) {
  throw new Error('Missing Stripe secret key');
}

// Initialize Stripe with the appropriate key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia',
});

// Add a flag to identify test mode
const isTestMode = isDevelopment || stripeSecretKey.startsWith('sk_test_');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount = 2500, email } = req.body;

    // Create a PaymentIntent with the specified amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      receipt_email: email,
      metadata: {
        isTest: isTestMode ? 'true' : 'false',
        environment: process.env.NODE_ENV
      }
    });

    // Return the client secret to the client
    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      isTestMode
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An error occurred',
      isTestMode
    });
  }
}
