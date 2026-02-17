import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const SIZES = ["S", "M", "L", "XL", "XXL"];

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    sale_price: "",
    is_featured: false,
    is_active: true,
    team_id: "",
    league_id: "",
    season_id: "",
    jersey_type_id: "",
    country_id: "",
    meta_title: "",
    meta_description: "",
  });
  const [variants, setVariants] = useState<Array<{ size: string; stock: number; sku: string }>>([]);
  const [images, setImages] = useState<Array<{ url: string }>>([]);

  useEffect(() => {
    document.title = isEdit ? "Edit Product - Admin" : "New Product - Admin";
    supabase.from("categories").select("id, name, type").then(({ data }) => setCategories(data || []));
    if (!isEdit) return;

    supabase.from("products").select("*").eq("id", id).single().then(({ data: product }) => {
      if (!product) return;
      setForm({
        title: product.title,
        slug: product.slug,
        description: product.description || "",
        price: String(product.price),
        sale_price: product.sale_price ? String(product.sale_price) : "",
        is_featured: product.is_featured,
        is_active: product.is_active,
        team_id: product.team_id || "",
        league_id: product.league_id || "",
        season_id: product.season_id || "",
        jersey_type_id: product.jersey_type_id || "",
        country_id: product.country_id || "",
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
      });
    });

    supabase.from("product_variants").select("*").eq("product_id", id).then(({ data }) => setVariants(data?.map(v => ({ size: v.size, stock: Number(v.stock), sku: v.sku })) || []));
    supabase.from("product_images").select("*").eq("product_id", id).order("position").then(({ data }) => setImages(data?.map(image => ({ url: image.url })) || []));
  }, [id, isEdit]);

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const categoriesByType = (type: string) => categories.filter(category => category.type === type);

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const path = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setImages(prev => [...prev, { url: data.publicUrl }]);
    setUploading(false);
  };

  const save = async () => {
    if (!form.title || !form.price) return;
    if (!variants.length || variants.some(v => !v.size || !v.sku.trim())) {
      toast({ title: "Add at least one valid variant with SKU", variant: "destructive" });
      return;
    }

    setLoading(true);
    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      description: form.description || null,
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
      const { error } = await supabase.from("products").update(payload).eq("id", id!);
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error || !data) {
        toast({ title: "Create failed", description: error?.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      productId = data.id;
    }

    if (isEdit) await supabase.from("product_variants").delete().eq("product_id", productId!);
    await supabase.from("product_variants").insert(variants.map(variant => ({ product_id: productId!, size: variant.size, stock: variant.stock, sku: variant.sku.trim() })));

    if (isEdit) await supabase.from("product_images").delete().eq("product_id", productId!);
    if (images.length) await supabase.from("product_images").insert(images.map((image, index) => ({ product_id: productId!, url: image.url, position: index })));

    toast({ title: isEdit ? "Product updated" : "Product created" });
    navigate("/admin/products");
    setLoading(false);
  };

  return (
    <div className="max-w-3xl">
      <h2 className="mb-5 text-2xl font-bold">{isEdit ? "Edit Product" : "New Product"}</h2>

      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value, slug: isEdit ? prev.slug : generateSlug(e.target.value) }))}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} />
          </div>
          <div>
            <Label>Price ($)</Label>
            <Input type="number" step="0.01" value={form.price} onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))} />
          </div>
          <div>
            <Label>Sale Price ($)</Label>
            <Input type="number" step="0.01" value={form.sale_price} onChange={e => setForm(prev => ({ ...prev, sale_price: e.target.value }))} />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={4} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(["team", "league", "season", "jersey_type", "country"] as const).map(type => (
            <div key={type}>
              <Label className="capitalize">{type.replace("_", " ")}</Label>
              <Select value={(form as any)[`${type}_id`] || "none"} onValueChange={value => setForm(prev => ({ ...prev, [`${type}_id`]: value === "none" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categoriesByType(type).map(category => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <Switch checked={form.is_featured} onCheckedChange={value => setForm(prev => ({ ...prev, is_featured: value }))} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <Switch checked={form.is_active} onCheckedChange={value => setForm(prev => ({ ...prev, is_active: value }))} />
            Active
          </label>
        </div>

        <div>
          <Label>Images</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={`${image.url}-${index}`} className="group relative h-20 w-20 overflow-hidden rounded border border-border">
                <img src={image.url} className="h-full w-full object-cover" />
                <button type="button" onClick={() => setImages(prev => prev.filter((_, i) => i !== index))} className="absolute inset-0 flex items-center justify-center bg-foreground/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Trash2 className="h-4 w-4 text-background" />
                </button>
              </div>
            ))}
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded border-2 border-dashed border-border transition-colors hover:border-primary">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <input type="file" accept="image/*" className="hidden" onChange={uploadImage} disabled={uploading} />
            </label>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Variants</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setVariants(prev => [
                  ...prev,
                  {
                    size: SIZES[prev.length % SIZES.length],
                    stock: 0,
                    sku: `${(form.slug || "sku").slice(0, 30)}-${SIZES[prev.length % SIZES.length]}-${Date.now()}`,
                  },
                ])
              }
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {variants.map((variant, index) => (
              <div key={`${variant.sku}-${index}`} className="flex items-center gap-2">
                <Select value={variant.size} onValueChange={value => setVariants(prev => prev.map((entry, i) => i === index ? { ...entry, size: value } : entry))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>{SIZES.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Stock" value={variant.stock} onChange={e => setVariants(prev => prev.map((entry, i) => i === index ? { ...entry, stock: Number(e.target.value) } : entry))} className="w-24" />
                <Input placeholder="SKU" value={variant.sku} onChange={e => setVariants(prev => prev.map((entry, i) => i === index ? { ...entry, sku: e.target.value } : entry))} className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => setVariants(prev => prev.filter((_, i) => i !== index))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Meta Title</Label>
            <Input value={form.meta_title} onChange={e => setForm(prev => ({ ...prev, meta_title: e.target.value }))} />
          </div>
          <div>
            <Label>Meta Description</Label>
            <Input value={form.meta_description} onChange={e => setForm(prev => ({ ...prev, meta_description: e.target.value }))} />
          </div>
        </div>

        <Button onClick={save} disabled={loading || !form.title || !form.price} className="w-full" size="lg">
          {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
