import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

export async function generateUniqueUsername(base: string): Promise<string> {
  const supabase = createClientComponentClient<Database>();
  const sanitized = base.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  let username = sanitized;
  let counter = 1;
  
  while (true) {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username as string)
      .single();

    if (!data) {
      return username;
    }

    username = `${sanitized}${counter}`;
    counter++;
  }
} 