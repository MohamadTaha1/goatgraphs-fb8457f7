import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const { toast } = useToast();

  const load = () => {
    supabase.from('products').select('id, title, slug, price, sale_price, is_active, is_featured, product_images(url, position)').order('created_at', { ascending: false }).then(({ data }) => setProducts(data || []));
  };

  useEffect(() => { document.title = 'Products – Admin'; load(); }, []);

  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast({ title: 'Product deleted' });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Products</h2>
        <Button asChild><Link to="/admin/products/new"><Plus className="h-4 w-4 mr-1" /> New Product</Link></Button>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="text-left p-3">Image</th><th className="text-left p-3">Title</th><th className="text-right p-3">Price</th><th className="text-center p-3">Active</th><th className="text-right p-3">Actions</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3"><div className="w-10 h-10 bg-muted rounded overflow-hidden">{p.product_images?.[0]?.url && <img src={p.product_images[0].url} className="w-full h-full object-cover" />}</div></td>
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-right">${Number(p.price).toFixed(2)}</td>
                <td className="p-3 text-center">{p.is_active ? '✓' : '✗'}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon"><Link to={`/admin/products/${p.id}/edit`}><Edit className="h-4 w-4" /></Link></Button>
                    <Button variant="ghost" size="icon" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {!products.length && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
