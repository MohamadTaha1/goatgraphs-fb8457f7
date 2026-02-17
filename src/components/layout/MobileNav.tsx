import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

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
    <Sheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
        <div className="aurora p-6 text-white">
          <span className="font-black text-xl tracking-tight">GOATGRAPHS</span>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/80">Navigation</p>
        </div>
        <nav className="space-y-2 p-6">
          {links.map(l => (
            <Link
              key={l.href}
              to={l.href}
              onClick={onClose}
              className="block rounded-lg border border-transparent px-3 py-2 text-base font-semibold transition-colors hover:border-border hover:bg-muted"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-4 space-y-2 border-t border-border pt-4">
            {user ? (
              <>
                <Link to={isAdmin ? "/admin" : "/account"} onClick={onClose} className="block rounded-lg px-3 py-2 text-base font-semibold hover:bg-muted">
                  {isAdmin ? "Admin Dashboard" : "My Account"}
                </Link>
                {isAdmin && <Link to="/account" onClick={onClose} className="block rounded-lg px-3 py-2 text-base font-semibold hover:bg-muted">Customer Account</Link>}
                <Button variant="destructive" className="w-full justify-start" onClick={() => { signOut(); onClose(); }}>Sign Out</Button>
              </>
            ) : (
              <Link to="/auth" onClick={onClose} className="block rounded-lg bg-primary px-3 py-2 text-base font-semibold text-primary-foreground">Sign In</Link>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
