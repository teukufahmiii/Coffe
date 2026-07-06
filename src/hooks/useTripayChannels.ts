import { useQuery } from '@tanstack/react-query';
import { tripayService } from '@/services/tripayService';

export function useTripayChannels() {
  return useQuery({
    queryKey: ['tripay-channels'],
    queryFn: () => tripayService.getPaymentChannels(),
    staleTime: 1000 * 60 * 60,
    retry: 2,
  });
}
