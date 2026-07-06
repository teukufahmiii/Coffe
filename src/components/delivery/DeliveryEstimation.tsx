import { Clock } from "lucide-react";
import { calculateEstimatedArrival } from "@/services/estimationService";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type DeliveryEstimationProps = {
  branchId: string;
  branchPrepTimeMinutes: number;
  distanceKm: number;
  driverSpeedKmh?: number;
};

export function DeliveryEstimation({ branchId, branchPrepTimeMinutes, distanceKm, driverSpeedKmh = 30 }: DeliveryEstimationProps) {
  const [queueCount, setQueueCount] = useState(0);
  
  useEffect(() => {
    // Initial fetch
    const fetchQueue = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', branchId)
        .in('status', ['pending', 'cooking']);
        
      setQueueCount(count || 0);
    };
    
    fetchQueue();
    
    // Subscribe to changes
    const ch = supabase.channel(`queue-${branchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `branch_id=eq.${branchId}` }, () => {
        fetchQueue();
      })
      .subscribe();
      
    return () => { supabase.removeChannel(ch); };
  }, [branchId]);

  const travelTimeMinutes = Math.ceil((distanceKm / driverSpeedKmh) * 60);
  const estimatedMinutes = calculateEstimatedArrival(branchPrepTimeMinutes, queueCount, travelTimeMinutes);

  return (
    <div className="flex items-center justify-between rounded-xl border border-accent/20 bg-accent/5 p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-full bg-accent/20 text-accent">
          <Clock className="size-5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estimasi Tiba</div>
          <div className="font-display font-bold text-accent text-lg">~{estimatedMinutes} Menit</div>
        </div>
      </div>
      <div className="text-right text-xs text-muted-foreground">
        <div>Jarak: {distanceKm.toFixed(1)} km</div>
        <div>Antrian: {queueCount} order</div>
      </div>
    </div>
  );
}
