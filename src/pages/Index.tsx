import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, Trophy, Truck, Zap } from "lucide-react";
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

  const heroCards = useMemo(() => featured.slice(0, 2), [featured]);
  const heroHeadline = heroCards[0]?.title || "Premium matchday jerseys";

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Enter your email", variant: "destructive" });
      return;
    }
    toast({ title: "Subscribed", description: "You are now in the drop and restock list." });
    setEmail("");
  };

  return (
    <>
      <section className="container py-8 md:py-12">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_22%_14%,rgba(255,255,255,0.14),transparent_38%),radial-gradient(circle_at_88%_8%,rgba(0,211,190,0.18),transparent_35%),linear-gradient(130deg,#0f172a_0%,#1e293b_52%,#0f3e45_100%)] p-5 text-white shadow-[0_28px_80px_-28px_rgba(2,12,27,0.65)] md:p-8">
          <div className="grid items-end gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Reimagined 2026 Storefront
              </p>

              <h1 className="mt-4 text-balance text-4xl font-black leading-[0.92] tracking-tight md:text-6xl">
                The modern home for
                <span className="block text-cyan-300">authentic football jerseys.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
                Browse verified kits from top clubs and national teams with a faster shopping flow, stronger filtering, and clearer product details across desktop and mobile.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-white font-semibold text-slate-950 hover:bg-white/90">
                  <Link to="/shop">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent font-semibold text-white hover:bg-white/10">
                  <Link to="/shop?sort=newest">See New Arrivals</Link>
                </Button>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Truck, title: "Fast Dispatch", value: "24-48h handling" },
                  { icon: ShieldCheck, title: "Verified Stock", value: "100% authentic" },
                  { icon: Zap, title: "Responsive UX", value: "Mobile-first UI" },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
                    <item.icon className="h-4 w-4 text-cyan-300" />
                    <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/70">{item.title}</p>
                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.14em] text-white/70">Featured highlight</p>
                <p className="mt-2 text-xl font-bold leading-tight">{heroHeadline}</p>
                <p className="mt-2 text-sm text-white/75">Curated weekly from the latest active catalog.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {heroCards.map((product) => (
                  <Link key={product.id} to={`/product/${product.slug}`} className="group overflow-hidden rounded-2xl border border-white/20 bg-white/10">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img
                        src={product.product_images?.[0]?.url || "/placeholder.svg"}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-semibold leading-tight">{product.title}</p>
                      <p className="mt-1 text-xs text-white/70">${Number(product.sale_price || product.price).toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container pb-3">
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                to={`/shop/${category.type}/${category.slug}`}
                className="rounded-full border border-border/80 bg-white/70 px-4 py-2 text-sm font-semibold text-foreground/80 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container py-12">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-3xl font-black tracking-tight md:text-4xl">Trending Jerseys</h2>
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <>
            <div className="mb-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              {featured[0] && (
                <Link to={`/product/${featured[0].slug}`} className="group overflow-hidden rounded-2xl border border-border/80 bg-white/90 p-4 shadow-sm">
                  <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
                    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                      <img src={featured[0].product_images?.[0]?.url || "/placeholder.svg"} alt={featured[0].title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                        <Trophy className="h-3.5 w-3.5" />
                        Editor pick
                      </p>
                      <h3 className="mt-3 text-2xl font-bold leading-tight">{featured[0].title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Premium material, verified authenticity, and full variant support.
                      </p>
                      <p className="mt-3 text-lg font-bold text-foreground">${Number(featured[0].sale_price || featured[0].price).toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              )}
              <div className="grid grid-cols-2 gap-4">
                {featured.slice(1, 5).map((product) => (
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
            </div>
            {featured.length > 5 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {featured.slice(5).map((product) => (
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
            )}
          </>
        ) : (
          <div className="soft-panel p-10 text-center text-muted-foreground">
            <p className="text-lg font-semibold text-foreground">No products yet</p>
            <p className="mt-1 text-sm">Add products in admin to populate this section.</p>
          </div>
        )}
      </section>

      <section className="container py-4">
        <div className="rounded-3xl border border-border/80 bg-white/85 p-6 backdrop-blur md:p-8">
          <div className="grid gap-5 md:grid-cols-2 md:items-center">
            <div>
              <h3 className="text-2xl font-black tracking-tight md:text-3xl">Get early access to drops and restocks</h3>
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                Subscribe for curated release alerts, limited promotions, and major restock notifications.
              </p>
            </div>
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubscribe}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" className="h-11" />
              <Button type="submit" className="h-11 px-6 font-semibold">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
