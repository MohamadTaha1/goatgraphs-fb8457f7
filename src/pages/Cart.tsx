import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const { items, updateQuantity, removeItem, total, itemCount, clearCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Cart - GoatGraphs";
  }, []);

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="display-title text-4xl">Your Cart Is Empty</h1>
        <p className="mt-2 text-muted-foreground">Add jerseys to start your order.</p>
        <Button asChild className="mt-6">
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="display-title text-3xl sm:text-4xl">Your Cart ({itemCount})</h1>
        <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.variantId} className="soft-panel flex gap-4 p-4">
              <Link to={`/product/${item.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-muted" />}
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/product/${item.slug}`} className="line-clamp-1 text-sm font-semibold hover:text-primary">{item.title}</Link>
                <p className="mt-0.5 text-xs text-muted-foreground">Size: {item.size}</p>
                <p className="mt-1 text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end justify-between gap-3">
                <button type="button" onClick={() => removeItem(item.variantId)} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center rounded-md border border-border bg-background">
                  <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-1.5">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-1.5">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="soft-panel h-fit p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-semibold">Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-lg font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Button asChild className="mt-5 w-full" size="lg">
            <Link to={user ? "/checkout" : "/auth"}>{user ? "Proceed to Checkout" : "Sign In to Checkout"}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
