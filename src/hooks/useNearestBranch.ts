import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Branch } from '@/types/branch';
import { calculateDistance } from '@/services/locationService';

export function useNearestBranch(userLat: number | null, userLng: number | null) {
  return useQuery({
    queryKey: ['nearest-branch', userLat, userLng],
    queryFn: async () => {
      // 1. Fetch all active branches
      const { data: branches, error } = await supabase
        .from('branches')
        .select('*')
        .eq('is_active', true);
        
      if (error) throw error;
      if (!branches || branches.length === 0) return null;
      
      // If user location is not available, just return the list as is
      if (!userLat || !userLng) {
        return branches as Branch[];
      }
      
      // 2. Calculate distance to all branches
      const branchesWithDistance = (branches as Branch[]).map(branch => {
        const distance = calculateDistance(userLat, userLng, branch.latitude, branch.longitude);
        return { ...branch, distance };
      });
      
      // 3. Sort by distance
      branchesWithDistance.sort((a, b) => a.distance - b.distance);
      
      // 4. Return all sorted branches
      return branchesWithDistance;
    },
    enabled: userLat !== null && userLng !== null, // Only run when we have coordinates
  });
}
