import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

// Since we only have live keys, we'll use them for all environments
const stripeSecretKey = process.env.STRIPE_SECRET_KEY_LIVE;

if (!stripeSecretKey) {
  throw new Error('Missing Stripe secret key');
}

// Initialize Stripe with the live key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27.acacia',
});

// Add a flag to identify test payments in development
const isTestEnvironment = process.env.NODE_ENV !== 'production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount } = req.body;
    
    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Log a warning about using live keys in development
    if (isTestEnvironment) {
      console.warn(
        '⚠️ WARNING: Creating a REAL payment intent with LIVE keys in development environment. ' +
        'This will create actual charges if completed with a real card.'
      );
    }
    
    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        integration_check: 'accept_a_payment',
        purpose: 'forum_post',
        environment: isTestEnvironment ? 'development' : 'production'
      },
      // Add a description to clearly identify test payments
      description: isTestEnvironment ? 'TEST PAYMENT - DO NOT PROCESS' : 'Forum Post Payment'
    });
    
    console.log('Payment intent created:', paymentIntent.id);

    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      isTestEnvironment
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ 
      error: 'Error creating payment intent',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}
