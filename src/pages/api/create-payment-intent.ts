import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as const,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create payment intent without customer information
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2500, // $25.00
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        // Store only anonymous session ID
        anonymous_session: req.body.sessionId,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating payment intent' });
  }
}