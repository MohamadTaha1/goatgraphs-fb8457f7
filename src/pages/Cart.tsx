import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();
  const { user } = useAuth();

  useEffect(() => { document.title = 'Cart – GoatGraphs'; }, []);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-3xl font-black tracking-tight mb-2">YOUR CART IS EMPTY</h1>
        <p className="text-muted-foreground mb-6">Add some jerseys to get started.</p>
        <Button asChild><Link to="/shop">Continue Shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-black tracking-tight mb-8">YOUR CART ({itemCount})</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.variantId} className="flex gap-4 p-4 border border-border rounded-lg">
              <Link to={`/product/${item.slug}`} className="w-20 h-20 bg-muted rounded overflow-hidden shrink-0">
                {item.image ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.slug}`} className="font-semibold text-sm hover:text-primary line-clamp-1">{item.title}</Link>
                <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                <p className="font-bold text-sm mt-1">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => removeItem(item.variantId)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                <div className="flex items-center border border-border rounded">
                  <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-1"><Minus className="h-3 w-3" /></button>
                  <span className="px-2 text-xs font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-1"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-muted p-6 rounded-lg h-fit">
          <h2 className="font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">${total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium">Calculated at checkout</span></div>
          </div>
          <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
          <Button asChild className="w-full mt-6" size="lg">
            <Link to={user ? '/checkout' : '/auth'}>{user ? 'Proceed to Checkout' : 'Sign In to Checkout'}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
