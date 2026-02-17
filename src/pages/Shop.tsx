import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { id: "newest", label: "Newest" },
  { id: "featured", label: "Featured" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams<{ type?: string; slug?: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");

  const sort = searchParams.get("sort") || "newest";
  const q = searchParams.get("q") || "";
  const teamFilter = searchParams.get("team") || "";
  const leagueFilter = searchParams.get("league") || "";

  const teams = useMemo(() => categories.filter(c => c.type === "team"), [categories]);
  const leagues = useMemo(() => categories.filter(c => c.type === "league"), [categories]);

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (!value) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  useEffect(() => {
    document.title = "Shop Jerseys - GoatGraphs";
    supabase
      .from("categories")
      .select("id, name, slug, type")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  useEffect(() => {
    setPage(1);
  }, [sort, q, teamFilter, leagueFilter, params.type, params.slug]);

  useEffect(() => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    let query = supabase
      .from("products")
      .select("id, title, slug, price, sale_price, is_featured, created_at, product_images(url, position), categories!products_team_id_fkey(name, slug), cat_type:categories!products_jersey_type_id_fkey(name), cat_season:categories!products_season_id_fkey(name), team_id, league_id, season_id, jersey_type_id, country_id", { count: "exact" })
      .eq("is_active", true)
      .range(from, from + PAGE_SIZE - 1);

    if (q) query = query.ilike("title", `%${q}%`);

    if (params.type && params.slug && params.slug !== "all") {
      const cat = categories.find(c => c.type === params.type && c.slug === params.slug);
      if (cat) {
        const col = params.type === "team" ? "team_id" : params.type === "league" ? "league_id" : params.type === "country" ? "country_id" : params.type === "season" ? "season_id" : "jersey_type_id";
        query = query.eq(col, cat.id);
      }
    }

    if (teamFilter) query = query.eq("team_id", teamFilter);
    if (leagueFilter) query = query.eq("league_id", leagueFilter);

    if (sort === "newest") query = query.order("created_at", { ascending: false });
    else if (sort === "price_asc") query = query.order("price", { ascending: true });
    else if (sort === "price_desc") query = query.order("price", { ascending: false });
    else if (sort === "featured") query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });

    query.then(({ data, count }) => {
      setProducts(data || []);
      setTotal(count || 0);
      setLoading(false);
    });
  }, [page, sort, q, teamFilter, leagueFilter, categories, params.type, params.slug]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pageTitle = params.type && params.slug !== "all" ? categories.find(c => c.type === params.type && c.slug === params.slug)?.name || "Shop" : q ? `Search: "${q}"` : "All Jerseys";

  const activeFilters = [teamFilter && teams.find(t => t.id === teamFilter)?.name, leagueFilter && leagues.find(l => l.id === leagueFilter)?.name].filter(Boolean);

  return (
    <div className="container py-8 md:py-10">
      <div className="soft-panel mb-6 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="display-title text-3xl sm:text-4xl">{pageTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{total} product{total !== 1 ? "s" : ""} found</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <form
              onSubmit={e => {
                e.preventDefault();
                updateParams({ q: searchInput.trim() || null });
              }}
              className="relative w-full sm:w-[280px]"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search jerseys" className="pl-9" />
            </form>

            <Select value={sort} onValueChange={value => updateParams({ sort: value })}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters(prev => !prev)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className={`${showFilters ? "block" : "hidden"} soft-panel h-fit space-y-5 p-4 lg:block`}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">Refine</h2>
            {(teamFilter || leagueFilter || q) && (
              <button type="button" onClick={() => { setSearchInput(""); updateParams({ q: null, team: null, league: null }); }} className="text-xs font-semibold text-primary hover:underline">
                Clear all
              </button>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Team</p>
            <div className="space-y-1">
              {teams.map(team => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => updateParams({ team: teamFilter === team.id ? null : team.id })}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${teamFilter === team.id ? "bg-secondary text-foreground" : "hover:bg-muted"}`}
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">League</p>
            <div className="space-y-1">
              {leagues.map(league => (
                <button
                  key={league.id}
                  type="button"
                  onClick={() => updateParams({ league: leagueFilter === league.id ? null : league.id })}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${leagueFilter === league.id ? "bg-secondary text-foreground" : "hover:bg-muted"}`}
                >
                  {league.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {activeFilters.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {activeFilters.map(label => (
                <span key={label} className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium">
                  {label}
                </span>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-muted p-3">
                  <div className="aspect-square rounded-lg bg-slate-200/65" />
                  <div className="mt-3 h-3 rounded bg-slate-200/65" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-slate-200/65" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {products.map((p: any) => (
                  <ProductCard
                    key={p.id}
                    slug={p.slug}
                    title={p.title}
                    price={p.price}
                    salePrice={p.sale_price}
                    image={p.product_images?.sort((a: any, b: any) => a.position - b.position)?.[0]?.url}
                    teamName={p.categories?.name}
                    jerseyType={p.cat_type?.name}
                    seasonName={p.cat_season?.name}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="soft-panel py-12 text-center">
              <p className="text-lg font-semibold">No products found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different filter or keyword.</p>
              <Button className="mt-4" variant="outline" onClick={() => { setSearchInput(""); updateParams({ q: null, team: null, league: null }); }}>
                <X className="mr-2 h-4 w-4" />
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
