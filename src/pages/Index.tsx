import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/products/ProductCard';

export default function Index() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    document.title = 'GoatGraphs – Premium Football Jerseys';
    supabase
      .from('products')
      .select('id, title, slug, price, sale_price, is_featured, product_images(url, position), categories!products_team_id_fkey(name), cat_type:categories!products_jersey_type_id_fkey(name), cat_season:categories!products_season_id_fkey(name)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => { if (data) setFeatured(data); });

    supabase
      .from('categories')
      .select('id, name, slug, type, image_url')
      .in('type', ['team', 'league'])
      .limit(6)
      .then(({ data }) => { if (data) setCategories(data); });
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black leading-[0.9] mb-6 tracking-tight">
              AUTHENTIC<br />FOOTBALL<br />JERSEYS
            </h1>
            <p className="text-lg opacity-70 mb-8 max-w-md">
              Premium match-worn and authentic jerseys from the world's greatest clubs and national teams.
            </p>
            <div className="flex gap-3">
              <Button asChild size="lg" className="font-semibold">
                <Link to="/shop">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-semibold border-background/30 text-background hover:bg-background/10">
                <Link to="/shop?sort=newest">New Arrivals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Truck, label: 'Free Shipping Over $150' },
            { icon: Shield, label: '100% Authentic' },
            { icon: RotateCcw, label: '30-Day Returns' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured / Trending */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black tracking-tight">TRENDING JERSEYS</h2>
          <Link to="/shop" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p: any) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                title={p.title}
                price={p.price}
                salePrice={p.sale_price}
                image={p.product_images?.[0]?.url}
                teamName={p.categories?.name}
                jerseyType={p.cat_type?.name}
                seasonName={p.cat_season?.name}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">No products yet</p>
            <p className="text-sm">Add products via the admin panel to see them here.</p>
          </div>
        )}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-black tracking-tight mb-8">SHOP BY CATEGORY</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat: any) => (
                <Link key={cat.id} to={`/shop/${cat.type}/${cat.slug}`} className="group relative aspect-[4/3] bg-foreground rounded-lg overflow-hidden">
                  {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />}
                  <div className="absolute inset-0 flex items-end p-6">
                    <h3 className="text-background font-bold text-lg">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-black tracking-tight mb-3">JOIN THE CLUB</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Subscribe for exclusive drops, early access, and special offers.
        </p>
        <form className="flex gap-2 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
          <input type="email" placeholder="Your email" className="flex-1 h-11 px-4 border border-border rounded-md bg-background text-sm" />
          <Button type="submit" size="lg">Subscribe</Button>
        </form>
      </section>
    </>
  );
}
