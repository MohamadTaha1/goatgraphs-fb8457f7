import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface Props { open: boolean; onClose: () => void; }

const links = [
  { label: 'Shop All', href: '/shop' },
  { label: 'Teams', href: '/shop/team/all' },
  { label: 'Leagues', href: '/shop/league/all' },
  { label: 'Countries', href: '/shop/country/all' },
  { label: 'New Arrivals', href: '/shop?sort=newest' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function MobileNav({ open, onClose }: Props) {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <span className="font-black text-lg">GOATGRAPHS</span>
        </div>
        <nav className="p-6 space-y-4">
          {links.map(l => (
            <Link key={l.href} to={l.href} onClick={onClose} className="block text-lg font-medium hover:text-primary transition-colors">
              {l.label}
            </Link>
          ))}
          <div className="border-t border-border pt-4 mt-4 space-y-4">
            {user ? (
              <>
                <Link to="/account" onClick={onClose} className="block text-lg font-medium">My Account</Link>
                {isAdmin && <Link to="/admin" onClick={onClose} className="block text-lg font-medium">Admin</Link>}
                <button onClick={() => { signOut(); onClose(); }} className="block text-lg font-medium text-destructive">Sign Out</button>
              </>
            ) : (
              <Link to="/auth" onClick={onClose} className="block text-lg font-medium">Sign In</Link>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
