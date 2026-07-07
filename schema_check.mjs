import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: menuItems, error: menuErr } = await supabase.from('menu_items').select('*').limit(1);
  console.log("Menu Items:", menuItems, menuErr);
  
  const { data: branches, error: branchErr } = await supabase.from('branches').select('*').limit(1);
  console.log("Branches:", branches, branchErr);
}
check();
