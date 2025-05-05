import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import rateLimit from 'express-rate-limit';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Schema for password reset validation
const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

// Rate limiter: 5 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  // Add a custom key generator that works with Next.js API routes
  keyGenerator: (req) => {
    // Use X-Forwarded-For header, falling back to a default for local development
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = 
      (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : forwardedFor?.[0]) || 
      req.socket?.remoteAddress || 
      '127.0.0.1';
    
    return ip;
  },
  // Skip rate limiting in development
  skip: () => process.env.NODE_ENV === 'development',
});

// Apply rate limiting to this API route
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Apply rate limiting (wrapped in try/catch to handle any errors)
    try {
      await new Promise((resolve) => {
        limiter(req, res, resolve);
      });
    } catch (error) {
      console.warn('Rate limiting error (continuing anyway):', error);
      // Continue processing the request even if rate limiting fails
    }

    // Validate request
    const { token, password } = resetSchema.parse(req.body);
    console.log('Received token for validation:', token);

    // Check if token exists and is valid
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('user_id, expires_at')
      .eq('token', token)
      .single();

    console.log('Token lookup result:', { tokenData, tokenError });

    if (tokenError || !tokenData) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    if (now > expiresAt) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    // Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.user_id,
      { password }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return res.status(500).json({ error: 'Failed to update password' });
    }

    // Delete the used token
    await supabaseAdmin
      .from('password_reset_tokens')
      .delete()
      .eq('token', token);

    // Return success response
    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset completion error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
