import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingBag, Truck, RotateCcw, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/products/ProductCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase
      .from('products')
      .select('*, categories!products_team_id_fkey(name, slug), cat_type:categories!products_jersey_type_id_fkey(name), cat_season:categories!products_season_id_fkey(name), cat_league:categories!products_league_id_fkey(name)')
      .eq('slug', slug)
      .single()
      .then(async ({ data: p }) => {
        if (!p) { setLoading(false); return; }
        setProduct(p);
        document.title = `${p.title} – GoatGraphs`;

        const [{ data: imgs }, { data: vars }] = await Promise.all([
          supabase.from('product_images').select('*').eq('product_id', p.id).order('position'),
          supabase.from('product_variants').select('*').eq('product_id', p.id),
        ]);
        setImages(imgs || []);
        setVariants(vars || []);

        // Related by team
        if (p.team_id) {
          const { data: rel } = await supabase
            .from('products')
            .select('id, title, slug, price, sale_price, product_images(url, position), categories!products_team_id_fkey(name), cat_type:categories!products_jersey_type_id_fkey(name)')
            .eq('team_id', p.team_id)
            .neq('id', p.id)
            .eq('is_active', true)
            .limit(4);
          setRelated(rel || []);
        }
        setLoading(false);
      });
  }, [slug]);

  const selectedVariant = variants.find(v => v.size === selectedSize);

  const handleAddToCart = () => {
    if (!selectedVariant || !product) return;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      size: selectedSize,
      price: product.sale_price || product.price,
      quantity,
      image: images[0]?.url,
      slug: product.slug,
    });
    toast({ title: 'Added to cart', description: `${product.title} (${selectedSize})` });
  };

  if (loading) return <div className="container mx-auto px-4 py-16 text-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>;
  if (!product) return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Product not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <div>
          <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
            {images[selectedImage] ? (
              <img src={images[selectedImage].url} alt={images[selectedImage].alt_text || product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={img.id} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded border-2 overflow-hidden shrink-0 ${i === selectedImage ? 'border-primary' : 'border-border'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex gap-2 mb-3 flex-wrap">
            {product.categories?.name && <Badge variant="secondary">{product.categories.name}</Badge>}
            {product.cat_type?.name && <Badge variant="outline">{product.cat_type.name}</Badge>}
            {product.cat_season?.name && <Badge variant="outline">{product.cat_season.name}</Badge>}
            {product.cat_league?.name && <Badge variant="outline">{product.cat_league.name}</Badge>}
          </div>

          <h1 className="text-3xl font-black tracking-tight mb-2">{product.title}</h1>

          <div className="flex items-center gap-3 mb-6">
            {product.sale_price ? (
              <>
                <span className="text-2xl font-bold">${Number(product.sale_price).toFixed(2)}</span>
                <span className="text-lg text-muted-foreground line-through">${Number(product.price).toFixed(2)}</span>
                <Badge className="bg-destructive text-destructive-foreground">Sale</Badge>
              </>
            ) : (
              <span className="text-2xl font-bold">${Number(product.price).toFixed(2)}</span>
            )}
          </div>

          {/* Size selector */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-2">Size</p>
            <div className="flex gap-2 flex-wrap">
              {variants.map(v => (
                <button key={v.id} onClick={() => setSelectedSize(v.size)} disabled={v.stock <= 0}
                  className={`h-10 px-4 rounded border text-sm font-medium transition-colors ${
                    selectedSize === v.size ? 'bg-foreground text-background border-foreground' :
                    v.stock <= 0 ? 'opacity-30 cursor-not-allowed border-border' : 'border-border hover:border-foreground'
                  }`}>
                  {v.size}
                </button>
              ))}
            </div>
            {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
              <p className="text-xs text-destructive mt-1">Only {selectedVariant.stock} left</p>
            )}
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex gap-3 mb-8">
            <div className="flex items-center border border-border rounded">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2"><Minus className="h-4 w-4" /></button>
              <span className="px-4 text-sm font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2"><Plus className="h-4 w-4" /></button>
            </div>
            <Button onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock <= 0} className="flex-1" size="lg">
              <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
            </Button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-3 mb-8 text-center">
            {[
              { icon: Truck, text: 'Free Shipping' },
              { icon: Shield, text: 'Authentic' },
              { icon: RotateCcw, text: '30-Day Returns' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1 p-3 bg-muted rounded">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-medium text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>

          {/* Accordion details */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent><p className="text-sm text-muted-foreground whitespace-pre-line">{product.description || 'No description.'}</p></AccordionContent>
            </AccordionItem>
            <AccordionItem value="details">
              <AccordionTrigger>Details</AccordionTrigger>
              <AccordionContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Material: 100% Polyester</li>
                  <li>Official licensed product</li>
                  <li>Machine washable</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping & Returns</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">Free shipping on orders over $150. Standard delivery: 5-7 business days. Express: 2-3 business days. 30-day return policy.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-black tracking-tight mb-6">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p: any) => (
              <ProductCard key={p.id} slug={p.slug} title={p.title} price={p.price} salePrice={p.sale_price}
                image={p.product_images?.sort((a: any, b: any) => a.position - b.position)?.[0]?.url}
                teamName={p.categories?.name} jerseyType={p.cat_type?.name} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
