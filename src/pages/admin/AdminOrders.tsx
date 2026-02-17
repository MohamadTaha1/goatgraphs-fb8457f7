import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const load = () => supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => setOrders(data || []));

  useEffect(() => {
    document.title = "Orders - Admin";
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) toast({ title: "Status update failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Status updated" });
      setOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order));
    }
  };

  const filtered = useMemo(() => {
    const list = statusFilter === "all" ? orders : orders.filter(order => order.status === statusFilter);
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(order => order.id.toLowerCase().includes(q) || order.status.toLowerCase().includes(q) || order.payment_method.toLowerCase().includes(q));
  }, [orders, statusFilter, query]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Orders</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map(status => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search orders" className="pl-9" />
      </div>

      <div className="space-y-2 md:hidden">
        {filtered.map(order => (
          <div key={order.id} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-semibold">${Number(order.total).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Payment</p>
                <p className="capitalize">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Shipping</p>
                <p className="capitalize">{order.shipping_method}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Select value={order.status} onValueChange={value => updateStatus(order.id, value)}>
                  <SelectTrigger className="mt-1 h-8 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(status => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
        {!filtered.length && <p className="py-6 text-center text-muted-foreground">No orders found.</p>}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Shipping</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id} className="border-t border-border">
                <td className="p-3 font-semibold">#{order.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right font-semibold">${Number(order.total).toFixed(2)}</td>
                <td className="p-3 capitalize">{order.payment_method}</td>
                <td className="p-3 capitalize">{order.shipping_method}</td>
                <td className="p-3">
                  <Select value={order.status} onValueChange={value => updateStatus(order.id, value)}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(status => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
