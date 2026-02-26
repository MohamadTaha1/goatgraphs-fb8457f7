import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MobileNav from './MobileNav';

const navLinks = [
  { label: 'Shop All', href: '/shop' },
  { label: 'Teams', href: '/shop/team/all' },
  { label: 'Leagues', href: '/shop/league/all' },
  { label: 'Countries', href: '/shop/country/all' },
  { label: 'New Arrivals', href: '/shop?sort=newest' },
];

export default function Header() {
  const { user, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <div className="bg-foreground text-background">
        <div className="container py-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-background/70 sm:text-xs">
          Free Shipping Over $150 · Verified Authentic Jerseys
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 transition-colors hover:bg-muted lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to="/" className="shrink-0">
            <span className="block text-lg font-black leading-none tracking-tight sm:text-xl">GOATGRAPHS</span>
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">Premium Matchwear</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
            {navLinks.map(link => (
              <Link key={link.href} to={link.href} className="text-foreground/70 transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-md p-2 transition-colors hover:bg-muted"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link to={user ? (isAdmin ? "/admin" : "/account") : "/auth"} aria-label="Account" className="rounded-md p-2 transition-colors hover:bg-muted">
              <User className="h-5 w-5" />
            </Link>

            <Link to="/cart" aria-label="Cart" className="relative rounded-md p-2 transition-colors hover:bg-muted">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link to="/admin" className="hidden md:block">
                <Button variant="outline" size="sm" className="font-semibold">Admin</Button>
              </Link>
            )}
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur">
            <form onSubmit={handleSearch} className="container mx-auto flex max-w-3xl gap-2">
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search a team, player, jersey..."
                autoFocus
                className="flex-1"
              />
              <Button type="submit" className="font-semibold">Search</Button>
              <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} className="rounded-md p-2 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
