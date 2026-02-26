import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Crown, Shield, Star, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/products/ProductCard";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    document.title = "GoatGraphs - Premium Football Jerseys";

    supabase
      .from("products")
      .select("id, title, slug, price, sale_price, is_featured, product_images(url, position), categories!products_team_id_fkey(name), cat_type:categories!products_jersey_type_id_fkey(name), cat_season:categories!products_season_id_fkey(name)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data) setFeatured(data);
      });

    supabase
      .from("categories")
      .select("id, name, slug, type, image_url")
      .in("type", ["team", "league"])
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  const heroProduct = useMemo(() => featured[0], [featured]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Enter your email", variant: "destructive" });
      return;
    }
    toast({ title: "Subscribed!", description: "You'll be the first to know about new drops." });
    setEmail("");
  };

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, hsl(43 74% 49% / 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, hsl(43 74% 49% / 0.2) 0%, transparent 50%)" }} />
        <div className="container relative py-16 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                <Crown className="h-3.5 w-3.5" />
                Premium Collection
              </div>

              <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                Wear the
                <span className="block text-primary">legacy.</span>
              </h1>

              <p className="mt-6 text-base leading-relaxed text-background/70 md:text-lg">
                Curated authentic football jerseys from the world's greatest clubs and national teams. Every shirt verified, every story preserved.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="gold-gradient border-0 px-8 font-semibold text-foreground hover:opacity-90">
                  <Link to="/shop">
                    Shop Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-background/20 bg-transparent font-semibold text-background hover:bg-background/10">
                  <Link to="/shop?sort=newest">New Arrivals</Link>
                </Button>
              </div>
            </div>

            {heroProduct && (
              <div className="flex justify-center lg:justify-end">
                <Link to={`/product/${heroProduct.slug}`} className="group relative">
                  <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
                  <div className="relative aspect-[3/4] w-72 overflow-hidden rounded-2xl border border-background/10 shadow-2xl md:w-80">
                    <img
                      src={heroProduct.product_images?.[0]?.url || "/placeholder.svg"}
                      alt={heroProduct.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                      <p className="text-sm font-semibold text-white">{heroProduct.title}</p>
                      <p className="mt-1 text-lg font-bold text-primary">${Number(heroProduct.sale_price || heroProduct.price).toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-border/60 bg-card">
        <div className="container grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          {[
            { icon: Shield, label: "100% Authentic" },
            { icon: Truck, label: "Fast Shipping" },
            { icon: Star, label: "Premium Quality" },
            { icon: Crown, label: "Exclusive Drops" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <item.icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <span className="text-sm font-semibold">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="container py-10">
          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Browse by</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/shop/${cat.type}/${cat.slug}`}
                className="rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      <section className="container pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">Trending Now</h2>
            <p className="mt-1 text-sm text-muted-foreground">The most sought-after jerseys this season</p>
          </div>
          <Link to="/shop" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                title={product.title}
                price={product.price}
                salePrice={product.sale_price}
                image={product.product_images?.[0]?.url}
                teamName={product.categories?.name}
                jerseyType={product.cat_type?.name}
                seasonName={product.cat_season?.name}
              />
            ))}
          </div>
        ) : (
          <div className="soft-panel p-10 text-center text-muted-foreground">
            <p className="text-lg font-semibold text-foreground">No products yet</p>
            <p className="mt-1 text-sm">Add products in admin to populate this section.</p>
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all jerseys <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-t border-border/60 bg-foreground text-background">
        <div className="container py-14">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-black tracking-tight md:text-4xl">Never Miss a Drop</h3>
            <p className="mt-3 text-sm text-background/60">
              Get early access to new arrivals, restocks, and exclusive promotions.
            </p>
            <form className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center" onSubmit={handleSubscribe}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-12 border-background/20 bg-background/10 text-background placeholder:text-background/40 sm:w-72"
              />
              <Button type="submit" className="gold-gradient h-12 border-0 px-8 font-semibold text-foreground hover:opacity-90">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
