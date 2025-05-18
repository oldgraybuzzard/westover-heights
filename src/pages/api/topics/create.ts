import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create authenticated Supabase client using the updated function
  const supabase = createPagesServerClient({ req, res });

  try {
    const { title, content, category } = req.body;
    const { data: session } = await supabase.auth.getSession();

    if (!session?.session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.session.user.id;

    // First check if user can post
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('can_post, post_count')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile check error:', profileError);
      return res.status(500).json({ error: 'Failed to check posting permission' });
    }

    if (!profile.can_post) {
      return res.status(403).json({ error: 'You do not have permission to post' });
    }

    // Step 1: Create the topic
    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .insert({
        title: title.trim(),
        content: content.trim(),
        category,
        author_id: userId,
        status: 'OPEN'
      })
      .select()
      .single();

    if (topicError) {
      console.error('Topic creation error:', topicError);
      return res.status(500).json({ 
        error: 'Failed to create topic', 
        details: topicError 
      });
    }

    // Step 2: Update profile in a separate query
    try {
      // Get current post count first to avoid ambiguity
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('post_count')
        .eq('id', userId)
        .single();
      
      const currentCount = currentProfile?.post_count || 0;
      
      // Then update with explicit value
      await supabase
        .from('profiles')
        .update({ 
          post_count: currentCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (profileError) {
      console.error('Profile update error:', profileError);
      // Continue even if this fails - the topic was created
    }

    return res.status(200).json(topicData);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ 
      error: 'Failed to create topic',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
