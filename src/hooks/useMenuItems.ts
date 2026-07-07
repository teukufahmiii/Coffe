import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMenuItems(branchSlug?: string, isAvailableOnly: boolean = true) {
  return useQuery({
    queryKey: ['menu_items', branchSlug, isAvailableOnly],
    queryFn: async () => {
      let query = supabase.from('menu_items').select('*');
      
      // Remove branch filter since menu is global
      // if (branchSlug) {
      //   query = query.eq('branch', branchSlug);
      // }
      
      if (isAvailableOnly && branchSlug) {
        query = query.contains('available_branches', [branchSlug]);
      }
      
      query = query.order('name');
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}
