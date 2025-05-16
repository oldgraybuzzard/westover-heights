import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, displayName = '' } = registerSchema.parse(req.body);

    // First, encrypt the email
    const { data: encryptedEmail, error: encryptError } = await supabase
      .rpc('encrypt_email', { p_email: email });

    if (encryptError) throw encryptError;

    // Then create the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        data: {
          encrypted_email: encryptedEmail,
          display_name: displayName
        }
      },
    });

    if (error) throw error;

    // Update the profile with encrypted email
    await supabase
      .from('profiles')
      .update({ encrypted_email: encryptedEmail })
      .eq('id', data.user?.id);

    res.status(200).json({
      message: 'Registration successful. Please check your email for verification.',
      user: data.user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      error: error instanceof z.ZodError 
        ? 'Invalid input' 
        : 'Registration failed' 
    });
  }
} 
