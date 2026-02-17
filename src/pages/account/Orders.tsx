import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-sky-100 text-sky-900",
  processing: "bg-violet-100 text-violet-900",
  shipped: "bg-blue-100 text-blue-900",
  delivered: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-rose-100 text-rose-900",
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setOrders(data || []));
  }, [user]);

  const filtered = useMemo(() => {
    if (!query.trim()) return orders;
    const q = query.trim().toLowerCase();
    return orders.filter(order => order.id.toLowerCase().includes(q) || order.status.toLowerCase().includes(q));
  }, [orders, query]);

  if (!orders.length) return <div className="text-muted-foreground">No orders yet.</div>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">My Orders</h2>
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search order id or status" className="w-full sm:w-64" />
      </div>

      <div className="space-y-2">
        {filtered.map(order => (
          <Link key={order.id} to={`/account/orders/${order.id}`} className="block rounded-xl border border-border p-4 transition-colors hover:bg-muted/50">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}>
                {order.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
              <span className="font-semibold text-foreground">${Number(order.total).toFixed(2)}</span>
            </div>
          </Link>
        ))}
        {!filtered.length && <p className="py-6 text-center text-sm text-muted-foreground">No matching orders.</p>}
      </div>
    </div>
  );
}
