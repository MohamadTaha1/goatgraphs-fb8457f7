import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    document.title = "Order Confirmed - GoatGraphs";
    if (id) supabase.from("orders").select("*").eq("id", id).single().then(({ data }) => setOrder(data));
  }, [id]);

  return (
    <div className="container py-16">
      <div className="soft-panel mx-auto max-w-xl p-8 text-center">
        <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-primary" />
        <h1 className="display-title text-4xl">Order Confirmed</h1>
        <p className="mt-2 text-muted-foreground">Thanks for your purchase. We will update your order status from your account area.</p>
        {order && (
          <p className="mt-4 text-sm text-muted-foreground">
            Order #{order.id.slice(0, 8).toUpperCase()} | Total ${Number(order.total).toFixed(2)}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/account/orders">View Orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
