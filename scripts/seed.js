import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

// Helper function to wait
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry an operation
async function retry(operation, maxAttempts = 5, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

async function clearDatabase() {
  console.log('Clearing existing data...');

  // Delete all replies first
  const { error: repliesError } = await supabase
    .from('replies')
    .delete()
    .gte('id', '00000000-0000-0000-0000-000000000000');

  if (repliesError) {
    console.error('Error deleting replies:', repliesError);
  }

  // Delete all topics
  const { error: topicsError } = await supabase
    .from('topics')
    .delete()
    .gte('id', '00000000-0000-0000-0000-000000000000');

  if (topicsError) {
    console.error('Error deleting topics:', topicsError);
  }

  // Delete existing users
  try {
    // List all users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    console.log(`Found ${users.length} users to delete`);

    // Delete each user
    for (const user of users) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.error(`Error deleting user ${user.email}:`, deleteError);
        } else {
          console.log(`Deleted user ${user.email}`);
        }
      } catch (error) {
        console.error(`Failed to delete user ${user.email}:`, error);
      }
      await sleep(500);
    }

  } catch (error) {
    console.error('Error in user cleanup:', error);
  }

  // Wait for deletions to complete
  await sleep(2000);
  console.log('Database cleared');
}

async function createUser(email, password, role = 'USER', displayName = null) {
  // Create new user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role,
      display_name: displayName || `user_${Math.random().toString(36).slice(2, 10)}`
    }
  });

  if (error) {
    throw error;
  }

  // Wait for profile creation trigger
  await sleep(2000);

  // Update profile if needed
  if (role !== 'USER' || displayName) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        role,
        display_name: displayName || data.user.user_metadata.display_name
      })
      .eq('id', data.user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    }
  }

  return data;
}

async function seedDatabase() {
  await clearDatabase();
  console.log('Starting database seeding...');

  try {
    // Create test user
    const testUser = await createUser('test@example.com', 'password123');
    console.log('Created test user:', testUser.user.email);

    // Create expert user
    const expertUser = await createUser(
      'terri@example.com',
      'expert123',
      'EXPERT',
      'Terri Warren'
    );
    console.log('Created expert user:', expertUser.user.email);

    // Wait for profiles to be created and then update expert profile
    await sleep(2000); // Wait for trigger to create profiles

    const { error: profileError } = await retry(async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'EXPERT', display_name: 'Terri Warren' })
        .eq('id', expertUser.user.id);

      if (error) throw error;
      return { error: null };
    });

    if (profileError) {
      console.error('Error updating expert profile:', profileError);
      return;
    }
    console.log('Updated expert profile');

    // Create topics
    const categories = ['Testing & Diagnosis', 'Treatment Options', 'General Questions'];
    const statuses = ['OPEN', 'ANSWERED', 'CLOSED'];

    for (let i = 0; i < 10; i++) {
      const { data: topic, error: topicError } = await supabase
        .from('topics')
        .insert({
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(2),
          author_id: testUser.user.id,
          category: categories[Math.floor(Math.random() * categories.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
        })
        .select()
        .single();

      if (topicError) {
        console.error('Error creating topic:', topicError);
        continue;
      }
      console.log(`Created topic: ${topic.title}`);

      // Add 1-2 replies to each topic
      const numReplies = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < numReplies; j++) {
        const isExpertReply = Math.random() < 0.5; // 50% chance of expert reply

        const { error: replyError } = await supabase.from('replies').insert({
          content: faker.lorem.paragraph(),
          author_id: isExpertReply ? expertUser.user.id : testUser.user.id,
          topic_id: topic.id,
        });

        if (replyError) {
          console.error('Error creating reply:', replyError);
        } else {
          console.log(`Created reply for topic: ${topic.title}`);
        }
      }
    }

    console.log('Seeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase().catch(console.error); 