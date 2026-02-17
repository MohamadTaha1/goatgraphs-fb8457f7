import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [address, setAddress] = useState({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'US' });

  const shippingCost = shippingMethod === 'express' ? 15 : (total >= 150 ? 0 : 9.99);
  const finalTotal = total - discount + shippingCost;

  useEffect(() => {
    document.title = 'Checkout – GoatGraphs';
    if (user) {
      supabase.from('addresses').select('*').eq('user_id', user.id).then(({ data }) => {
        if (data && data.length) {
          setAddresses(data);
          const def = data.find(a => a.is_default) || data[0];
          setAddress(def);
        }
      });
    }
  }, [user]);

  const applyPromo = async () => {
    const { data } = await supabase.from('promo_codes').select('*').eq('code', promoCode.toUpperCase()).eq('is_active', true).single();
    if (!data) { toast({ title: 'Invalid promo code', variant: 'destructive' }); return; }
    if (data.min_order && total < Number(data.min_order)) { toast({ title: `Minimum order $${data.min_order}`, variant: 'destructive' }); return; }
    const disc = data.type === 'percentage' ? total * (Number(data.value) / 100) : Number(data.value);
    setDiscount(disc);
    toast({ title: `Promo applied! -$${disc.toFixed(2)}` });
  };

  const placeOrder = async () => {
    if (!user || items.length === 0) return;
    setLoading(true);
    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user.id,
      subtotal: total,
      shipping_cost: shippingCost,
      discount,
      total: finalTotal,
      payment_method: paymentMethod,
      shipping_method: shippingMethod,
      address_snapshot: address,
      promo_code_used: promoCode || null,
    }).select('id').single();

    if (error || !order) { toast({ title: 'Error placing order', variant: 'destructive' }); setLoading(false); return; }

    const orderItems = items.map(i => ({
      order_id: order.id,
      product_id: i.productId,
      variant_id: i.variantId,
      product_title: i.title,
      size: i.size,
      quantity: i.quantity,
      price_snapshot: i.price,
    }));
    await supabase.from('order_items').insert(orderItems);
    await clearCart();
    navigate(`/order-success/${order.id}`);
  };

  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-black tracking-tight mb-8">CHECKOUT</h1>
      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-8">
          {/* Address */}
          <section>
            <h2 className="font-bold text-lg mb-4">Shipping Address</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Full Name</Label><Input value={address.full_name} onChange={e => setAddress(p => ({ ...p, full_name: e.target.value }))} required /></div>
              <div className="col-span-2"><Label>Phone</Label><Input value={address.phone || ''} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="col-span-2"><Label>Address</Label><Input value={address.address_line1} onChange={e => setAddress(p => ({ ...p, address_line1: e.target.value }))} required /></div>
              <div className="col-span-2"><Label>Apt/Suite</Label><Input value={address.address_line2 || ''} onChange={e => setAddress(p => ({ ...p, address_line2: e.target.value }))} /></div>
              <div><Label>City</Label><Input value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} required /></div>
              <div><Label>State</Label><Input value={address.state || ''} onChange={e => setAddress(p => ({ ...p, state: e.target.value }))} /></div>
              <div><Label>Postal Code</Label><Input value={address.postal_code} onChange={e => setAddress(p => ({ ...p, postal_code: e.target.value }))} required /></div>
              <div><Label>Country</Label><Input value={address.country} onChange={e => setAddress(p => ({ ...p, country: e.target.value }))} required /></div>
            </div>
          </section>

          {/* Shipping Method */}
          <section>
            <h2 className="font-bold text-lg mb-4">Shipping Method</h2>
            <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-2">
              <label className="flex items-center gap-3 border border-border p-3 rounded-lg cursor-pointer"><RadioGroupItem value="standard" /><div><p className="text-sm font-medium">Standard (5-7 days)</p><p className="text-xs text-muted-foreground">{total >= 150 ? 'Free' : '$9.99'}</p></div></label>
              <label className="flex items-center gap-3 border border-border p-3 rounded-lg cursor-pointer"><RadioGroupItem value="express" /><div><p className="text-sm font-medium">Express (2-3 days)</p><p className="text-xs text-muted-foreground">$15.00</p></div></label>
            </RadioGroup>
          </section>

          {/* Payment */}
          <section>
            <h2 className="font-bold text-lg mb-4">Payment Method</h2>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              <label className="flex items-center gap-3 border border-border p-3 rounded-lg cursor-pointer"><RadioGroupItem value="cod" /><p className="text-sm font-medium">Cash on Delivery</p></label>
              <label className="flex items-center gap-3 border border-border p-3 rounded-lg cursor-pointer"><RadioGroupItem value="card" /><p className="text-sm font-medium">Credit/Debit Card (Coming Soon)</p></label>
            </RadioGroup>
          </section>
        </div>

        {/* Summary */}
        <div className="md:col-span-2">
          <div className="bg-muted p-6 rounded-lg sticky top-24">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              {items.map(i => (
                <div key={i.variantId} className="flex justify-between"><span className="text-muted-foreground truncate mr-2">{i.title} ({i.size}) x{i.quantity}</span><span>${(i.price * i.quantity).toFixed(2)}</span></div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>${shippingCost.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-primary"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
            </div>
            {/* Promo */}
            <div className="flex gap-2 mt-3">
              <Input placeholder="Promo code" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="flex-1" />
              <Button variant="outline" size="sm" onClick={applyPromo}>Apply</Button>
            </div>
            <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total</span><span>${finalTotal.toFixed(2)}</span>
            </div>
            <Button onClick={placeOrder} disabled={loading || !address.full_name || !address.address_line1 || !address.city || !address.postal_code} className="w-full mt-4" size="lg">
              {loading ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
