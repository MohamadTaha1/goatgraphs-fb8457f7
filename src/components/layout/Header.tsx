import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MobileNav from './MobileNav';

const navLinks = [
  { label: 'Shop All', href: '/shop' },
  { label: 'Teams', href: '/shop/team/all', children: [] },
  { label: 'Leagues', href: '/shop/league/all', children: [] },
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
      {/* Top banner */}
      <div className="bg-foreground text-background text-center text-xs py-2 font-medium tracking-wide">
        FREE SHIPPING ON ORDERS OVER $150 | AUTHENTIC JERSEYS ONLY
      </div>

      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2">
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="font-black text-xl tracking-tight shrink-0">
            GOATGRAPHS
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {navLinks.map(link => (
              <Link key={link.href} to={link.href} className="hover:text-primary transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {/* User */}
            <Link to={user ? '/account' : '/auth'} className="p-2 hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="p-2 hover:text-primary transition-colors relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link to="/admin" className="hidden lg:block">
                <Button variant="outline" size="sm">Admin</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search overlay */}
        {searchOpen && (
          <div className="border-t border-border bg-background p-4">
            <form onSubmit={handleSearch} className="container mx-auto max-w-2xl flex gap-2">
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search a team, player, jersey..."
                autoFocus
                className="flex-1"
              />
              <Button type="submit">Search</Button>
              <button type="button" onClick={() => setSearchOpen(false)} className="p-2">
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
