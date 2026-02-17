import { useEffect, useMemo, useState } from "react";
import { DollarSign, FolderTree, Package, ShoppingCart, TriangleAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Metric = {
  products: number;
  orders: number;
  revenue: number;
  categories: number;
  lowStockVariants: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Metric>({
    products: 0,
    orders: 0,
    revenue: 0,
    categories: 0,
    lowStockVariants: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    document.title = "Admin Dashboard - GoatGraphs";
    Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, total, status, created_at").order("created_at", { ascending: false }),
      supabase.from("product_variants").select("id, stock").lte("stock", 5),
    ]).then(([productsRes, categoriesRes, ordersRes, lowStockRes]) => {
      const orders = ordersRes.data || [];
      setRecentOrders(orders.slice(0, 6));
      setStats({
        products: productsRes.count || 0,
        categories: categoriesRes.count || 0,
        orders: orders.length,
        revenue: orders.reduce((sum, row) => sum + Number(row.total), 0),
        lowStockVariants: (lowStockRes.data || []).length,
      });
    });
  }, []);

  const cards = useMemo(
    () => [
      { label: "Products", value: stats.products.toString(), icon: Package },
      { label: "Categories", value: stats.categories.toString(), icon: FolderTree },
      { label: "Orders", value: stats.orders.toString(), icon: ShoppingCart },
      { label: "Revenue", value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign },
    ],
    [stats],
  );

  return (
    <div>
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <p className="mt-1 text-sm text-muted-foreground">Monitor store health and recent activity.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(card => (
          <div key={card.label} className="rounded-xl border border-border bg-muted/25 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{card.label}</p>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <TriangleAlert className="h-4 w-4" />
          {stats.lowStockVariants} variants are low on stock (5 or less units).
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="p-3 text-left">Recent Orders</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order.id} className="border-t border-border">
                <td className="p-3 font-semibold">#{order.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="p-3 capitalize">{order.status}</td>
                <td className="p-3 text-right font-semibold">${Number(order.total).toFixed(2)}</td>
              </tr>
            ))}
            {!recentOrders.length && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
