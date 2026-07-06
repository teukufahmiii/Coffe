import { useState, useMemo } from 'react';
import { Cart, CartItem, CartTotals } from '@/types/cart';

export function useCart() {
  const [cart, setCart] = useState<Cart>({});

  const adjustQty = (item: Omit<CartItem, 'qty'>, delta: number) => {
    setCart((prevCart) => {
      const currentQty = prevCart[item.id]?.qty ?? 0;
      const nextQty = currentQty + delta;
      
      const newCart = { ...prevCart };
      if (nextQty <= 0) {
        delete newCart[item.id];
      } else {
        newCart[item.id] = { ...prevCart[item.id], ...item, qty: nextQty };
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const totals: CartTotals = useMemo(() => {
    const entries = Object.entries(cart);
    const count = entries.reduce((acc, [, item]) => acc + item.qty, 0);
    const total = entries.reduce((acc, [, item]) => acc + (item.qty * item.price), 0);
    return { count, total };
  }, [cart]);

  return {
    cart,
    adjustQty,
    clearCart,
    totals
  };
}
