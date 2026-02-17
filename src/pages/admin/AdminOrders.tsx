import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const { toast } = useToast();

  const load = () => supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => setOrders(data || []));
  useEffect(() => { document.title = 'Orders – Admin'; load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status: status as any }).eq('id', id);
    if (error) toast({ title: 'Error', variant: 'destructive' });
    else { toast({ title: 'Status updated' }); load(); }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Orders</h2>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left p-3">Order</th><th className="text-left p-3">Date</th><th className="text-right p-3">Total</th><th className="text-left p-3">Payment</th><th className="text-left p-3">Status</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-medium">#{o.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right">${Number(o.total).toFixed(2)}</td>
                <td className="p-3">{o.payment_method}</td>
                <td className="p-3">
                  <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                    <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
