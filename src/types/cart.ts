export type CartItem = {
  id: string;
  menuItemId?: string;
  name: string;
  price: number;
  qty: number;
  image_url?: string | null;
  category?: string;
  note?: string;
};

export type Cart = Record<string, CartItem>;

export type CartTotals = {
  count: number;
  total: number;
};
