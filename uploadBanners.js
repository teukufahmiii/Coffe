import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadFile(fileName) {
  const filePath = `./src/assets/${fileName}`;
  const fileBuffer = fs.readFileSync(filePath);
  
  const { data, error } = await supabase.storage
    .from('banners')
    .upload(`default_${fileName}`, fileBuffer, {
      contentType: 'image/png',
      upsert: true
    });
    
  if (error) {
    console.error('Error uploading', fileName, error);
    return;
  }
  
  const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(`default_${fileName}`);
  
  const { error: dbError } = await supabase.from('banners').insert({ image_url: publicUrl });
  if (dbError) {
    console.error('Error inserting', fileName, dbError);
  } else {
    console.log('Successfully added', fileName);
  }
}

async function run() {
  await uploadFile('lnr_promo.png');
  await uploadFile('lnr_tumbler_promo.png');
}

run();
