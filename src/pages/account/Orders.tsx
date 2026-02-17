import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setOrders(data || []));
  }, [user]);

  if (!orders.length) return <div className="text-muted-foreground">No orders yet.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">My Orders</h2>
      <div className="space-y-3">
        {orders.map(o => (
          <Link key={o.id} to={`/account/orders/${o.id}`} className="block border border-border rounded-lg p-4 hover:bg-muted transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">#{o.id.slice(0, 8).toUpperCase()}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[o.status] || ''}`}>{o.status}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{new Date(o.created_at).toLocaleDateString()}</span>
              <span className="font-medium text-foreground">${Number(o.total).toFixed(2)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
