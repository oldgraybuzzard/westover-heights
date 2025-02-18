import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, content, category } = req.body;
    const { data: session } = await supabase.auth.getSession();

    if (!session?.session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Create the topic - encryption will happen via database trigger
    const { data, error } = await supabase
      .from('topics')
      .insert({
        title,
        content,
        category,
        author_id: session.session.user.id,
        status: 'OPEN'
      })
      .select(`
        id,
        title,
        content,
        encrypted_content,
        category,
        status,
        author_id,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Topic creation error:', error);
      throw error;
    }

    // Verify encryption
    if (!data.encrypted_content) {
      console.error('Content was not encrypted:', {
        id: data.id,
        hasContent: !!data.content,
        hasEncryptedContent: !!data.encrypted_content
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ 
      error: 'Failed to create topic',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}