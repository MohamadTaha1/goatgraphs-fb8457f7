import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    document.title = 'Order Confirmed – GoatGraphs';
    if (id) supabase.from('orders').select('*').eq('id', id).single().then(({ data }) => setOrder(data));
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-lg">
      <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
      <h1 className="text-3xl font-black tracking-tight mb-2">ORDER CONFIRMED</h1>
      <p className="text-muted-foreground mb-2">Thank you for your purchase!</p>
      {order && <p className="text-sm text-muted-foreground mb-8">Order #{order.id.slice(0, 8).toUpperCase()} • Total: ${Number(order.total).toFixed(2)}</p>}
      <div className="flex gap-3 justify-center">
        <Button asChild><Link to="/account/orders">View Orders</Link></Button>
        <Button asChild variant="outline"><Link to="/shop">Continue Shopping</Link></Button>
      </div>
    </div>
  );
}
