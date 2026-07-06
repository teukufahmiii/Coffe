import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Order } from '@/types/order';

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.name) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (*, menu_items(image_url, category)),
            branches (name)
          `)
          .eq('customer_name', user.name)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();

    // Set up real-time subscription for updates
    if (user?.name) {
      const subscription = supabase
        .channel('public:orders')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'orders',
          filter: `customer_name=eq.${user.name}`
        }, () => {
          fetchOrders();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user?.name]);

  return { orders, isLoading, error };
}
