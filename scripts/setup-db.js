import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function setupDatabase() {
  console.log('Setting up database...');

  // Read the SQL file
  const sql = fs.readFileSync(
    join(__dirname, '../supabase/migrations/001_initial_schema.sql'),
    'utf8'
  );

  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Execute each statement
  for (const statement of statements) {
    const { error } = await supabase.rpc('exec_sql', { sql: statement });
    if (error) {
      console.error('Error executing SQL:', error);
      console.error('Statement:', statement);
    }
  }

  console.log('Database setup completed');
}

setupDatabase().catch(console.error); 