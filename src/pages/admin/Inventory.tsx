import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const { toast } = useToast();

  const load = () => {
    supabase.from('products').select('id, title, product_variants(id, size, stock, sku)').order('title').then(({ data }) => setProducts(data || []));
  };
  useEffect(() => { document.title = 'Inventory – Admin'; load(); }, []);

  const updateStock = async (variantId: string, stock: number) => {
    await supabase.from('product_variants').update({ stock }).eq('id', variantId);
    toast({ title: 'Stock updated' });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Inventory</h2>
      <div className="space-y-6">
        {products.map(p => (
          <div key={p.id} className="border border-border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">{p.title}</h3>
            {p.product_variants?.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {p.product_variants.map((v: any) => (
                  <div key={v.id} className="flex items-center gap-2">
                    <span className="text-xs font-medium w-8">{v.size}</span>
                    <Input type="number" defaultValue={v.stock} className="h-8 w-20 text-xs"
                      onBlur={e => updateStock(v.id, Number(e.target.value))} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No variants</p>
            )}
          </div>
        ))}
        {!products.length && <p className="text-center text-muted-foreground py-8">No products yet.</p>}
      </div>
    </div>
  );
}
