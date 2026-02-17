import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Minus, Plus, RotateCcw, Shield, ShoppingBag, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProductCard from "@/components/products/ProductCard";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase
      .from("products")
      .select("*, categories!products_team_id_fkey(name, slug), cat_type:categories!products_jersey_type_id_fkey(name), cat_season:categories!products_season_id_fkey(name), cat_league:categories!products_league_id_fkey(name)")
      .eq("slug", slug)
      .single()
      .then(async ({ data: p }) => {
        if (!p) {
          setLoading(false);
          return;
        }
        setProduct(p);
        document.title = `${p.title} - GoatGraphs`;

        const [{ data: imgs }, { data: vars }] = await Promise.all([
          supabase.from("product_images").select("*").eq("product_id", p.id).order("position"),
          supabase.from("product_variants").select("*").eq("product_id", p.id).order("size"),
        ]);
        setImages(imgs || []);
        setVariants(vars || []);
        if (vars?.length) {
          const firstAvailable = vars.find(v => v.stock > 0);
          if (firstAvailable) setSelectedSize(firstAvailable.size);
        }

        if (p.team_id) {
          const { data: rel } = await supabase
            .from("products")
            .select("id, title, slug, price, sale_price, product_images(url, position), categories!products_team_id_fkey(name), cat_type:categories!products_jersey_type_id_fkey(name)")
            .eq("team_id", p.team_id)
            .neq("id", p.id)
            .eq("is_active", true)
            .limit(4);
          setRelated(rel || []);
        }
        setLoading(false);
      });
  }, [slug]);

  const selectedVariant = variants.find(v => v.size === selectedSize);
  const maxQuantity = selectedVariant?.stock ? Math.max(1, selectedVariant.stock) : 1;

  const handleAddToCart = () => {
    if (!selectedVariant || !product) {
      toast({ title: "Select a size first", variant: "destructive" });
      return;
    }
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      size: selectedSize,
      price: product.sale_price || product.price,
      quantity: Math.min(quantity, selectedVariant.stock),
      image: images[0]?.url,
      slug: product.slug,
    });
    toast({ title: "Added to cart", description: `${product.title} (${selectedSize}) x${Math.min(quantity, selectedVariant.stock)}` });
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!product) {
    return <div className="container py-16 text-center text-muted-foreground">Product not found.</div>;
  }

  return (
    <div className="container py-8 md:py-10">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-12">
        <div className="space-y-3">
          <div className="soft-panel overflow-hidden p-2">
            <div className="aspect-square overflow-hidden rounded-xl bg-muted">
              {images[selectedImage] ? (
                <img src={images[selectedImage].url} alt={images[selectedImage].alt_text || product.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={img.id} type="button" onClick={() => setSelectedImage(i)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === selectedImage ? "border-primary" : "border-border"}`}>
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="soft-panel h-fit p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            {product.categories?.name && <Badge variant="secondary">{product.categories.name}</Badge>}
            {product.cat_type?.name && <Badge variant="outline">{product.cat_type.name}</Badge>}
            {product.cat_season?.name && <Badge variant="outline">{product.cat_season.name}</Badge>}
            {product.cat_league?.name && <Badge variant="outline">{product.cat_league.name}</Badge>}
          </div>

          <h1 className="display-title text-3xl">{product.title}</h1>
          <div className="mt-4 flex items-center gap-3">
            {product.sale_price ? (
              <>
                <span className="text-3xl font-bold">${Number(product.sale_price).toFixed(2)}</span>
                <span className="text-lg text-muted-foreground line-through">${Number(product.price).toFixed(2)}</span>
                <Badge className="bg-destructive text-destructive-foreground">Sale</Badge>
              </>
            ) : (
              <span className="text-3xl font-bold">${Number(product.price).toFixed(2)}</span>
            )}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold">Size</p>
            <div className="flex flex-wrap gap-2">
              {variants.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedSize(v.size);
                    setQuantity(1);
                  }}
                  disabled={v.stock <= 0}
                  className={`h-10 min-w-11 rounded-md border px-3 text-sm font-semibold transition-colors ${selectedSize === v.size ? "border-primary bg-primary text-primary-foreground" : v.stock <= 0 ? "cursor-not-allowed border-border opacity-35" : "border-border hover:border-primary/60 hover:bg-secondary"}`}
                >
                  {v.size}
                </button>
              ))}
            </div>
            {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && <p className="mt-2 text-xs font-semibold text-destructive">Only {selectedVariant.stock} left in stock</p>}
          </div>

          <div className="mt-6 flex gap-3">
            <div className="flex items-center rounded-md border border-border bg-background">
              <button type="button" onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="p-2">
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center text-sm font-semibold">{quantity}</span>
              <button type="button" onClick={() => setQuantity(prev => Math.min(maxQuantity, prev + 1))} className="p-2" disabled={quantity >= maxQuantity}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock <= 0} className="flex-1 font-semibold" size="lg">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: Truck, text: "Fast shipping" },
              { icon: Shield, text: "Authentic item" },
              { icon: RotateCcw, text: "Easy returns" },
            ].map(item => (
              <div key={item.text} className="rounded-xl border border-border/70 bg-muted/55 p-3">
                <item.icon className="mx-auto h-4 w-4 text-primary" />
                <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>

          <Accordion type="single" collapsible className="mt-6 w-full">
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{product.description || "No description provided."}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="details">
              <AccordionTrigger>Details</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Material: 100% polyester.</li>
                  <li>Official licensed product.</li>
                  <li>Machine washable.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping & Returns</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">Free shipping on orders over $150. Standard delivery in 5-7 business days or express in 2-3 business days. Returns accepted for 30 days.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="display-title mb-5 text-3xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p: any) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                title={p.title}
                price={p.price}
                salePrice={p.sale_price}
                image={p.product_images?.sort((a: any, b: any) => a.position - b.position)?.[0]?.url}
                teamName={p.categories?.name}
                jerseyType={p.cat_type?.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
