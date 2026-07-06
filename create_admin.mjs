import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://abtddrxdqnaxjmdnnuwz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sZgIA6nNMFG6GtHwTvunkw_i9uTuSWC';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@admin.com',
    password: 'admin123',
  });

  if (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  }

  console.log('User created successfully:', data.user?.email);
}

main();
