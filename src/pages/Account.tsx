import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Package, MapPin } from 'lucide-react';

const links = [
  { to: '/account', label: 'Profile', icon: User, exact: true },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/profile', label: 'Addresses', icon: MapPin },
];

export default function Account() {
  const { pathname } = useLocation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-black tracking-tight mb-8">MY ACCOUNT</h1>
      <div className="flex gap-8">
        <aside className="hidden md:block w-48 shrink-0">
          <nav className="space-y-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  (l.exact ? pathname === l.to : pathname.startsWith(l.to)) ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}>
                <l.icon className="h-4 w-4" />{l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1"><Outlet /></div>
      </div>
    </div>
  );
}
