import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Schema for token validation
const tokenSchema = z.object({
  token: z.string().min(10),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate request
    const { token } = tokenSchema.parse(req.body);
    console.log('Validating token:', token);

    // Check if token exists and is valid
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('expires_at')
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

    // Return success response
    return res.status(200).json({ valid: true });
  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}