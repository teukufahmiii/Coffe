export type OrderType = "dine-in" | "pickup" | "delivery";
export type OrderStatus = "pending" | "cooking" | "served" | "paid" | "completed" | "cancelled";
export type DriverType = "gosend" | "grabexpress";

export interface OrderItem {
  id?: string;
  order_id: string;
  menu_item_id?: string | null;
  name: string;
  qty: number;
  price: number;
  note?: string | null;
}

export interface Review {
  id?: string;
  order_id: string;
  branch_id?: string;
  rating: number;
  tags: string[];
  comment?: string;
  product_ratings?: { item_id: string; name: string; liked: boolean }[];
  created_at?: string;
}

export interface Order {
  id: string;
  branch_id?: string;
  table_number: number;
  order_type: OrderType;
  status: OrderStatus;
  total: number;
  note: string | null;
  created_at: string;
  customer_name?: string | null;
  customer_phone?: string;
  customer_address?: string;
  customer_lat?: number | null;
  customer_lng?: number | null;
  driver_type?: string;
  estimated_arrival_minutes?: number | null;
  payment_channel?: string | null;
  payment_url?: string;
  payment_reference?: string | null;
  payment_qr_url?: string;
  payment_instructions?: any | null;
  payment_code?: string;
  agreed_terms?: boolean;
  order_items?: OrderItem[];
  reviews?: Review[];
}
