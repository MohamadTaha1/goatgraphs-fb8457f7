import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  size: string;
  price: number;
  quantity: number;
  image?: string;
  slug: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const LOCAL_KEY = 'goatgraphs_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbCartId, setDbCartId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem(LOCAL_KEY);
      if (stored) {
        try { setItems(JSON.parse(stored)); } catch { setItems([]); }
      }
    }
  }, [user]);

  // Save to localStorage when items change (guest)
  useEffect(() => {
    if (!user) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    }
  }, [items, user]);

  // Sync with DB when user logs in
  useEffect(() => {
    if (!user) { setDbCartId(null); return; }
    const syncCart = async () => {
      setLoading(true);
      // Get or create cart
      let { data: cart } = await supabase.from('carts').select('id').eq('user_id', user.id).single();
      if (!cart) {
        const { data: newCart } = await supabase.from('carts').insert({ user_id: user.id }).select('id').single();
        cart = newCart;
      }
      if (!cart) { setLoading(false); return; }
      setDbCartId(cart.id);

      // Merge localStorage items into DB
      const localItems = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') as CartItem[];
      for (const item of localItems) {
        await supabase.from('cart_items').upsert({
          cart_id: cart.id,
          variant_id: item.variantId,
          quantity: item.quantity,
          price_snapshot: item.price,
        }, { onConflict: 'cart_id,variant_id' });
      }
      localStorage.removeItem(LOCAL_KEY);

      // Load from DB
      const { data: dbItems } = await supabase
        .from('cart_items')
        .select('variant_id, quantity, price_snapshot, product_variants(id, size, product_id, products(title, slug, product_images(url)))')
        .eq('cart_id', cart.id);

      if (dbItems) {
        const mapped: CartItem[] = dbItems.map((ci: any) => ({
          variantId: ci.variant_id,
          productId: ci.product_variants?.product_id || '',
          title: ci.product_variants?.products?.title || '',
          size: ci.product_variants?.size || '',
          price: Number(ci.price_snapshot),
          quantity: ci.quantity,
          image: ci.product_variants?.products?.product_images?.[0]?.url,
          slug: ci.product_variants?.products?.slug || '',
        }));
        setItems(mapped);
      }
      setLoading(false);
    };
    syncCart();
  }, [user]);

  const addItem = useCallback(async (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.variantId === item.variantId);
      if (existing) {
        return prev.map(i => i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
    if (user && dbCartId) {
      await supabase.from('cart_items').upsert({
        cart_id: dbCartId,
        variant_id: item.variantId,
        quantity: item.quantity,
        price_snapshot: item.price,
      }, { onConflict: 'cart_id,variant_id' });
    }
  }, [user, dbCartId]);

  const removeItem = useCallback(async (variantId: string) => {
    setItems(prev => prev.filter(i => i.variantId !== variantId));
    if (user && dbCartId) {
      await supabase.from('cart_items').delete().eq('cart_id', dbCartId).eq('variant_id', variantId);
    }
  }, [user, dbCartId]);

  const updateQuantity = useCallback(async (variantId: string, quantity: number) => {
    if (quantity <= 0) { removeItem(variantId); return; }
    setItems(prev => prev.map(i => i.variantId === variantId ? { ...i, quantity } : i));
    if (user && dbCartId) {
      await supabase.from('cart_items').update({ quantity }).eq('cart_id', dbCartId).eq('variant_id', variantId);
    }
  }, [user, dbCartId, removeItem]);

  const clearCart = useCallback(async () => {
    setItems([]);
    localStorage.removeItem(LOCAL_KEY);
    if (user && dbCartId) {
      await supabase.from('cart_items').delete().eq('cart_id', dbCartId);
    }
  }, [user, dbCartId]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
