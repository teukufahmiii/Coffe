import { supabase } from "@/integrations/supabase/client";
import { Order, OrderItem } from "@/types/order";

export const orderService = {
  async createOrder(order: Omit<Order, "id" | "created_at">): Promise<Order> {
    const { data, error } = await supabase
      .from("orders")
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  async createOrderItems(items: Omit<OrderItem, "id">[]): Promise<void> {
    const { error } = await supabase
      .from("order_items")
      .insert(items);

    if (error) throw error;
  }
};
