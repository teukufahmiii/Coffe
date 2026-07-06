import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMenuItems(branchSlug?: string, isAvailableOnly: boolean = true) {
  return useQuery({
    queryKey: ['menu_items', branchSlug, isAvailableOnly],
    queryFn: async () => {
      let query = supabase.from('menu_items').select('*');
      
      // Map branch slug to branch name used in menu_items if needed
      // Currently, menu_items seems to use 'kemang' or 'senopati' as 'branch' string
      if (branchSlug) {
        query = query.eq('branch', branchSlug);
      }
      
      if (isAvailableOnly) {
        // Checking for available column based on previous code review
        // In the database it might be 'is_available' or 'available', handling 'available' as seen in pickup.tsx
        query = query.eq('available', true); 
      }
      
      query = query.order('name');
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}
