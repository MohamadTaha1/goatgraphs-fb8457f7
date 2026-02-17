import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase.from("orders").select("*").eq("id", id).single().then(({ data }) => setOrder(data));
    supabase.from("order_items").select("*").eq("order_id", id).then(({ data }) => setItems(data || []));
  }, [id]);

  if (!order) return <div className="text-muted-foreground">Loading order...</div>;
  const addr = order.address_snapshot as any;

  return (
    <div>
      <Link to="/account/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <h2 className="text-2xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border p-4 text-sm">
          <p><span className="text-muted-foreground">Status:</span> <span className="font-semibold capitalize">{order.status}</span></p>
          <p className="mt-1"><span className="text-muted-foreground">Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
          <p className="mt-1"><span className="text-muted-foreground">Payment:</span> {order.payment_method === "cod" ? "Cash on delivery" : "Card"}</p>
          <p className="mt-1"><span className="text-muted-foreground">Shipping:</span> {order.shipping_method}</p>
        </div>

        {addr && (
          <div className="rounded-xl border border-border p-4 text-sm">
            <p className="font-semibold">Shipping Address</p>
            <p className="mt-1 text-muted-foreground">
              {addr.full_name}
              <br />
              {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}
              <br />
              {addr.city}, {addr.state} {addr.postal_code}
              <br />
              {addr.country}
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Size</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-t border-border">
                <td className="p-3">{item.product_title}</td>
                <td className="p-3">{item.size}</td>
                <td className="p-3 text-right">{item.quantity}</td>
                <td className="p-3 text-right">${Number(item.price_snapshot).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-1 text-right text-sm">
        <p>Subtotal: ${Number(order.subtotal).toFixed(2)}</p>
        <p>Shipping: ${Number(order.shipping_cost).toFixed(2)}</p>
        {Number(order.discount) > 0 && <p className="text-primary">Discount: -${Number(order.discount).toFixed(2)}</p>}
        <p className="text-lg font-bold">Total: ${Number(order.total).toFixed(2)}</p>
      </div>
    </div>
  );
}
