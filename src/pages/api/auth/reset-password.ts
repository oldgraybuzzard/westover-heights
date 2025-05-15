import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import Mailjet from 'node-mailjet';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize Mailjet
const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY || '',
  apiSecret: process.env.MAILJET_SECRET_KEY || '',
});

// Schema for email validation
const emailSchema = z.object({
  email: z.string().email(),
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

    // Validate email
    const { email } = emailSchema.parse(req.body);

    // Check if user exists (but don't reveal this information in the response)
    const { data, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    // Find the user with the matching email
    const user = data?.users?.find(u => u.email === email);
    
    if (userError) {
      console.error('Error checking user:', userError);
      // Don't reveal if user exists or not
      return res.status(200).json({ message: 'If your email exists in our system, you will receive reset instructions' });
    }

    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({ message: 'If your email exists in our system, you will receive reset instructions' });
    }

    // Generate a secure token
    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

    // Store the token in the database
    const { error: tokenError } = await supabaseAdmin
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      return res.status(500).json({ error: 'Failed to process request' });
    }

    // Generate reset URL
    const origin = req.headers.origin || process.env.NEXT_PUBLIC_SITE_URL;
    const resetUrl = `${origin}/reset-password?token=${resetToken}`;

    console.log('Generated reset URL:', resetUrl); // For debugging
    console.log('Token stored in database:', {
      user_id: user.id,
      token: resetToken,
      expires_at: expiresAt.toISOString()
    });

    // Send email using Mailjet
    const { error: mailError } = await sendResetEmail(email, resetUrl);
    
    if (mailError) {
      console.error('Error sending email:', mailError);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    // Return success response
    return res.status(200).json({ message: 'If your email exists in our system, you will receive reset instructions' });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}

async function sendResetEmail(email: string, resetUrl: string) {
  try {
    const response = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.EMAIL_FROM || 'noreply@westoverheights.com',
              Name: 'Westover Heights Clinic',
            },
            To: [
              {
                Email: email,
              },
            ],
            Subject: 'Reset Your Password - Westover Heights',
            TextPart: `
Reset Your Password - Westover Heights

Please click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.
            `,
            HTMLPart: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="color: #333; margin-bottom: 10px;">Reset Your Password</h2>
    <p style="color: #666; margin-bottom: 20px;">You requested a password reset for your Westover Heights account</p>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
    <p style="margin-bottom: 15px; font-weight: bold;">Please click the button below to reset your password:</p>
    <div style="text-align: center; margin: 25px 0;">
      <a href="${resetUrl}" style="background-color: #4a90e2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset My Password</a>
    </div>
    <p style="margin-top: 15px; font-size: 13px;">If the button doesn't work, copy and paste this URL into your browser:</p>
    <p style="margin-bottom: 0; word-break: break-all; color: #4a90e2; font-size: 13px;">${resetUrl}</p>
  </div>
  
  <div style="font-size: 12px; color: #777; margin-top: 20px;">
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request this password reset, please ignore this email.</p>
  </div>
</div>
            `,
          },
        ],
      });
    
    console.log('Reset email sent successfully to:', email);
    return { error: null };
  } catch (error) {
    console.error('Mailjet error:', error);
    return { error };
  }
}
