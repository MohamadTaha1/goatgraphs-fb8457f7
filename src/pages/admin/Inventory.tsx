import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type VariantDraft = Record<string, number>;

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [draft, setDraft] = useState<VariantDraft>({});
  const [query, setQuery] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const { toast } = useToast();

  const load = () => {
    supabase.from("products").select("id, title, product_variants(id, size, stock, sku)").order("title").then(({ data }) => {
      const list = data || [];
      setProducts(list);
      const nextDraft: VariantDraft = {};
      list.forEach(product => {
        product.product_variants?.forEach((variant: any) => {
          nextDraft[variant.id] = Number(variant.stock);
        });
      });
      setDraft(nextDraft);
    });
  };

  useEffect(() => {
    document.title = "Inventory - Admin";
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(product => product.title.toLowerCase().includes(q));
    }
    if (showLowStockOnly) {
      list = list.filter(product => product.product_variants?.some((variant: any) => Number(draft[variant.id] ?? variant.stock) <= 5));
    }
    return list;
  }, [products, query, showLowStockOnly, draft]);

  const pendingChanges = useMemo(() => {
    const updates: Array<{ id: string; stock: number }> = [];
    products.forEach(product => {
      product.product_variants?.forEach((variant: any) => {
        const nextStock = Number(draft[variant.id]);
        if (!Number.isNaN(nextStock) && nextStock !== Number(variant.stock)) {
          updates.push({ id: variant.id, stock: nextStock });
        }
      });
    });
    return updates;
  }, [products, draft]);

  const saveAll = async () => {
    if (!pendingChanges.length) return;
    const ops = pendingChanges.map(change => supabase.from("product_variants").update({ stock: change.stock }).eq("id", change.id));
    await Promise.all(ops);
    toast({ title: "Inventory updated", description: `${pendingChanges.length} variant(s) saved.` });
    load();
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <Button onClick={saveAll} disabled={!pendingChanges.length}>
          Save Changes ({pendingChanges.length})
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search product" className="pl-9" />
        </div>
        <Button variant={showLowStockOnly ? "default" : "outline"} onClick={() => setShowLowStockOnly(prev => !prev)}>
          {showLowStockOnly ? "Showing low stock" : "Show low stock only"}
        </Button>
      </div>

      <div className="space-y-4">
        {filtered.map(product => (
          <div key={product.id} className="rounded-xl border border-border p-4">
            <h3 className="mb-3 text-sm font-semibold">{product.title}</h3>
            {product.product_variants?.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {product.product_variants.map((variant: any) => {
                  const stock = Number(draft[variant.id] ?? variant.stock);
                  const low = stock <= 5;
                  return (
                    <div key={variant.id} className={`rounded-lg border p-2 ${low ? "border-amber-300 bg-amber-50" : "border-border"}`}>
                      <p className="text-xs font-semibold">{variant.size} <span className="text-muted-foreground">({variant.sku})</span></p>
                      <Input
                        type="number"
                        min={0}
                        value={stock}
                        onChange={e => setDraft(prev => ({ ...prev, [variant.id]: Math.max(0, Number(e.target.value)) }))}
                        className="mt-2 h-8 text-sm"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No variants</p>
            )}
          </div>
        ))}

        {!filtered.length && <p className="py-8 text-center text-sm text-muted-foreground">No products found.</p>}
      </div>
    </div>
  );
}
