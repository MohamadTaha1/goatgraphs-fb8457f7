import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Upload } from 'lucide-react';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', slug: '', description: '', price: '', sale_price: '', is_featured: false, is_active: true, team_id: '', league_id: '', season_id: '', jersey_type_id: '', country_id: '', meta_title: '', meta_description: '' });
  const [variants, setVariants] = useState<{ size: string; stock: number; sku: string; id?: string }[]>([]);
  const [images, setImages] = useState<{ url: string; id?: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.title = isEdit ? 'Edit Product – Admin' : 'New Product – Admin';
    supabase.from('categories').select('id, name, type').then(({ data }) => setCategories(data || []));
    if (isEdit) {
      supabase.from('products').select('*').eq('id', id).single().then(({ data: p }) => {
        if (p) setForm({ title: p.title, slug: p.slug, description: p.description || '', price: String(p.price), sale_price: p.sale_price ? String(p.sale_price) : '', is_featured: p.is_featured, is_active: p.is_active, team_id: p.team_id || '', league_id: p.league_id || '', season_id: p.season_id || '', jersey_type_id: p.jersey_type_id || '', country_id: p.country_id || '', meta_title: p.meta_title || '', meta_description: p.meta_description || '' });
      });
      supabase.from('product_variants').select('*').eq('product_id', id).then(({ data }) => setVariants(data?.map(v => ({ size: v.size, stock: v.stock, sku: v.sku, id: v.id })) || []));
      supabase.from('product_images').select('*').eq('product_id', id).order('position').then(({ data }) => setImages(data?.map(i => ({ url: i.url, id: i.id })) || []));
    }
  }, [id, isEdit]);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) { toast({ title: 'Upload failed', variant: 'destructive' }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    setImages(prev => [...prev, { url: publicUrl }]);
    setUploading(false);
  };

  const save = async () => {
    setLoading(true);
    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      description: form.description,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      is_featured: form.is_featured,
      is_active: form.is_active,
      team_id: form.team_id || null,
      league_id: form.league_id || null,
      season_id: form.season_id || null,
      jersey_type_id: form.jersey_type_id || null,
      country_id: form.country_id || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
    };

    let productId = id;
    if (isEdit) {
      const { error } = await supabase.from('products').update(payload).eq('id', id!);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setLoading(false); return; }
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select('id').single();
      if (error || !data) { toast({ title: 'Error', description: error?.message, variant: 'destructive' }); setLoading(false); return; }
      productId = data.id;
    }

    // Variants
    if (isEdit) await supabase.from('product_variants').delete().eq('product_id', productId!);
    if (variants.length) {
      await supabase.from('product_variants').insert(variants.map(v => ({ product_id: productId!, size: v.size, stock: v.stock, sku: v.sku })));
    }

    // Images
    if (isEdit) await supabase.from('product_images').delete().eq('product_id', productId!);
    if (images.length) {
      await supabase.from('product_images').insert(images.map((img, i) => ({ product_id: productId!, url: img.url, position: i })));
    }

    toast({ title: isEdit ? 'Product updated!' : 'Product created!' });
    navigate('/admin/products');
    setLoading(false);
  };

  const catsByType = (type: string) => categories.filter(c => c.type === type);

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6">{isEdit ? 'Edit Product' : 'New Product'}</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Label>Title</Label><Input value={form.title} onChange={e => { setForm(p => ({ ...p, title: e.target.value })); if (!isEdit) setForm(p => ({ ...p, slug: generateSlug(e.target.value) })); }} required /></div>
          <div className="col-span-2"><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} /></div>
          <div><Label>Price ($)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required /></div>
          <div><Label>Sale Price ($)</Label><Input type="number" step="0.01" value={form.sale_price} onChange={e => setForm(p => ({ ...p, sale_price: e.target.value }))} /></div>
        </div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4} /></div>

        <div className="grid grid-cols-2 gap-4">
          {(['team', 'league', 'season', 'jersey_type', 'country'] as const).map(type => (
            <div key={type}>
              <Label className="capitalize">{type.replace('_', ' ')}</Label>
              <Select value={(form as any)[`${type}_id`]} onValueChange={v => setForm(p => ({ ...p, [`${type}_id`]: v }))}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{catsByType(type).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm(p => ({ ...p, is_featured: v }))} /><span className="text-sm">Featured</span></label>
          <label className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} /><span className="text-sm">Active</span></label>
        </div>

        {/* Images */}
        <div>
          <Label>Images</Label>
          <div className="flex gap-2 flex-wrap mt-2">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded border border-border overflow-hidden group">
                <img src={img.url} className="w-full h-full object-cover" />
                <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Trash2 className="h-4 w-4 text-background" /></button>
              </div>
            ))}
            <label className="w-20 h-20 rounded border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <input type="file" accept="image/*" className="hidden" onChange={uploadImage} disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Variants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Variants (Sizes)</Label>
            <Button variant="outline" size="sm" onClick={() => setVariants(prev => [...prev, { size: SIZES[prev.length % SIZES.length], stock: 0, sku: `${form.slug || 'sku'}-${SIZES[prev.length % SIZES.length]}-${Date.now()}` }])}><Plus className="h-3 w-3 mr-1" /> Add</Button>
          </div>
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Select value={v.size} onValueChange={val => setVariants(prev => prev.map((vr, j) => j === i ? { ...vr, size: val } : vr))}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>{SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Stock" value={v.stock} onChange={e => setVariants(prev => prev.map((vr, j) => j === i ? { ...vr, stock: Number(e.target.value) } : vr))} className="w-24" />
                <Input placeholder="SKU" value={v.sku} onChange={e => setVariants(prev => prev.map((vr, j) => j === i ? { ...vr, sku: e.target.value } : vr))} className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => setVariants(prev => prev.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><Label>Meta Title</Label><Input value={form.meta_title} onChange={e => setForm(p => ({ ...p, meta_title: e.target.value }))} /></div>
          <div><Label>Meta Description</Label><Input value={form.meta_description} onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))} /></div>
        </div>

        <Button onClick={save} disabled={loading || !form.title || !form.price} className="w-full" size="lg">
          {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </div>
  );
}
