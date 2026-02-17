import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const load = () => {
    supabase.from("products").select("id, title, slug, price, sale_price, is_active, is_featured, product_images(url, position)").order("created_at", { ascending: false }).then(({ data }) => setProducts(data || []));
  };

  useEffect(() => {
    document.title = "Products - Admin";
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(product => product.title.toLowerCase().includes(q) || product.slug.toLowerCase().includes(q));
  }, [products, query]);

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else toast({ title: "Product deleted" });
    load();
  };

  const updateFlag = async (id: string, key: "is_active" | "is_featured", value: boolean) => {
    const { error } = await supabase.from("products").update({ [key]: value }).eq("id", id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else setProducts(prev => prev.map(product => product.id === id ? { ...product, [key]: value } : product));
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Link>
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by title or slug" className="pl-9" />
      </div>

      <div className="space-y-2 md:hidden">
        {filtered.map(product => (
          <div key={product.id} className="rounded-xl border border-border p-3">
            <div className="flex items-start gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {product.product_images?.[0]?.url && <img src={product.product_images[0].url} className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-semibold">{product.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{product.slug}</p>
                <p className="mt-1 text-sm font-semibold">${Number(product.sale_price || product.price).toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center justify-between rounded-md border border-border px-2 py-1.5">
                Active
                <Switch checked={!!product.is_active} onCheckedChange={value => updateFlag(product.id, "is_active", value)} />
              </label>
              <label className="flex items-center justify-between rounded-md border border-border px-2 py-1.5">
                Featured
                <Switch checked={!!product.is_featured} onCheckedChange={value => updateFlag(product.id, "is_featured", value)} />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <Button asChild size="sm" variant="outline" className="flex-1">
                <Link to={`/admin/products/${product.id}/edit`}>
                  <Edit className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              <Button size="sm" variant="destructive" className="flex-1" onClick={() => del(product.id)}>
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}
        {!filtered.length && <p className="py-6 text-center text-muted-foreground">No products found.</p>}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="p-3 text-left">Image</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-right">Price</th>
              <th className="p-3 text-center">Active</th>
              <th className="p-3 text-center">Featured</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => (
              <tr key={product.id} className="border-t border-border">
                <td className="p-3">
                  <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                    {product.product_images?.[0]?.url && <img src={product.product_images[0].url} className="h-full w-full object-cover" />}
                  </div>
                </td>
                <td className="p-3">
                  <p className="font-semibold">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.slug}</p>
                </td>
                <td className="p-3 text-right font-semibold">${Number(product.sale_price || product.price).toFixed(2)}</td>
                <td className="p-3 text-center">
                  <Switch checked={!!product.is_active} onCheckedChange={value => updateFlag(product.id, "is_active", value)} />
                </td>
                <td className="p-3 text-center">
                  <Switch checked={!!product.is_featured} onCheckedChange={value => updateFlag(product.id, "is_featured", value)} />
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button asChild size="icon" variant="ghost">
                      <Link to={`/admin/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => del(product.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
