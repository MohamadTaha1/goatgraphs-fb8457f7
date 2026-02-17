import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase.from('orders').select('*').eq('id', id).single().then(({ data }) => setOrder(data));
    supabase.from('order_items').select('*').eq('order_id', id).then(({ data }) => setItems(data || []));
  }, [id]);

  if (!order) return <div className="text-muted-foreground">Loading...</div>;

  const addr = order.address_snapshot as any;

  return (
    <div>
      <Link to="/account/orders" className="text-sm text-primary hover:underline flex items-center gap-1 mb-4"><ArrowLeft className="h-4 w-4" /> Back to Orders</Link>
      <h2 className="text-xl font-bold mb-6">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Status:</span> <span className="font-medium capitalize">{order.status}</span></p>
          <p><span className="text-muted-foreground">Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
          <p><span className="text-muted-foreground">Payment:</span> {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Card'}</p>
          <p><span className="text-muted-foreground">Shipping:</span> {order.shipping_method}</p>
        </div>
        {addr && (
          <div className="text-sm">
            <p className="font-medium mb-1">Shipping Address</p>
            <p className="text-muted-foreground">{addr.full_name}<br />{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}<br />{addr.city}, {addr.state} {addr.postal_code}<br />{addr.country}</p>
          </div>
        )}
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left p-3">Product</th><th className="text-left p-3">Size</th><th className="text-right p-3">Qty</th><th className="text-right p-3">Price</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id} className="border-t border-border">
                <td className="p-3">{i.product_title}</td>
                <td className="p-3">{i.size}</td>
                <td className="p-3 text-right">{i.quantity}</td>
                <td className="p-3 text-right">${Number(i.price_snapshot).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-right space-y-1">
        <p>Subtotal: ${Number(order.subtotal).toFixed(2)}</p>
        <p>Shipping: ${Number(order.shipping_cost).toFixed(2)}</p>
        {Number(order.discount) > 0 && <p className="text-primary">Discount: -${Number(order.discount).toFixed(2)}</p>}
        <p className="font-bold text-lg">Total: ${Number(order.total).toFixed(2)}</p>
      </div>
    </div>
  );
}
