import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/products/ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';

const PAGE_SIZE = 12;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams<{ type?: string; slug?: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const sort = searchParams.get('sort') || 'newest';
  const q = searchParams.get('q') || '';
  const teamFilter = searchParams.get('team') || '';
  const leagueFilter = searchParams.get('league') || '';

  useEffect(() => {
    document.title = 'Shop Jerseys – GoatGraphs';
    supabase.from('categories').select('id, name, slug, type').then(({ data }) => { if (data) setCategories(data); });
  }, []);

  useEffect(() => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    let query = supabase
      .from('products')
      .select('id, title, slug, price, sale_price, is_featured, created_at, product_images(url, position), categories!products_team_id_fkey(name, slug), cat_type:categories!products_jersey_type_id_fkey(name), cat_season:categories!products_season_id_fkey(name), team_id, league_id, season_id, jersey_type_id, country_id', { count: 'exact' })
      .eq('is_active', true)
      .range(from, from + PAGE_SIZE - 1);

    if (q) query = query.ilike('title', `%${q}%`);

    // Category page filter
    if (params.type && params.slug && params.slug !== 'all') {
      const cat = categories.find(c => c.type === params.type && c.slug === params.slug);
      if (cat) {
        const col = params.type === 'team' ? 'team_id' : params.type === 'league' ? 'league_id' : params.type === 'country' ? 'country_id' : params.type === 'season' ? 'season_id' : 'jersey_type_id';
        query = query.eq(col, cat.id);
      }
    }

    if (teamFilter) query = query.eq('team_id', teamFilter);
    if (leagueFilter) query = query.eq('league_id', leagueFilter);

    if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (sort === 'featured') query = query.order('is_featured', { ascending: false });

    query.then(({ data, count }) => {
      setProducts(data || []);
      setTotal(count || 0);
      setLoading(false);
    });
  }, [page, sort, q, teamFilter, leagueFilter, categories, params.type, params.slug]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const teams = categories.filter(c => c.type === 'team');
  const leagues = categories.filter(c => c.type === 'league');

  const pageTitle = params.type && params.slug !== 'all'
    ? categories.find(c => c.type === params.type && c.slug === params.slug)?.name || 'Shop'
    : q ? `Search: "${q}"` : 'All Jerseys';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">{total} product{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
          </Button>
          <Select value={sort} onValueChange={v => { setSearchParams(prev => { prev.set('sort', v); return prev; }); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price_asc">Price: Low → High</SelectItem>
              <SelectItem value="price_desc">Price: High → Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-56 shrink-0 space-y-6`}>
          {teams.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Team</h3>
              <div className="space-y-1">
                {teams.map(t => (
                  <button key={t.id} onClick={() => { setSearchParams(prev => { prev.set('team', t.id); return prev; }); setPage(1); }}
                    className={`block text-sm w-full text-left px-2 py-1 rounded hover:bg-muted ${teamFilter === t.id ? 'bg-muted font-medium' : ''}`}>
                    {t.name}
                  </button>
                ))}
                {teamFilter && <button onClick={() => { setSearchParams(prev => { prev.delete('team'); return prev; }); }} className="text-xs text-primary flex items-center gap-1 mt-1"><X className="h-3 w-3" /> Clear</button>}
              </div>
            </div>
          )}
          {leagues.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">League</h3>
              <div className="space-y-1">
                {leagues.map(l => (
                  <button key={l.id} onClick={() => { setSearchParams(prev => { prev.set('league', l.id); return prev; }); setPage(1); }}
                    className={`block text-sm w-full text-left px-2 py-1 rounded hover:bg-muted ${leagueFilter === l.id ? 'bg-muted font-medium' : ''}`}>
                    {l.name}
                  </button>
                ))}
                {leagueFilter && <button onClick={() => { setSearchParams(prev => { prev.delete('league'); return prev; }); }} className="text-xs text-primary flex items-center gap-1 mt-1"><X className="h-3 w-3" /> Clear</button>}
              </div>
            </div>
          )}
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((p: any) => (
                  <ProductCard key={p.id} slug={p.slug} title={p.title} price={p.price} salePrice={p.sale_price}
                    image={p.product_images?.sort((a: any, b: any) => a.position - b.position)?.[0]?.url}
                    teamName={p.categories?.name} jerseyType={p.cat_type?.name} seasonName={p.cat_season?.name} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} size="sm" onClick={() => setPage(i + 1)}>{i + 1}</Button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-muted-foreground">No products found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
