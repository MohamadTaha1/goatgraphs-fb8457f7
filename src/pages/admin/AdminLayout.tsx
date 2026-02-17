import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Tag, Boxes } from 'lucide-react';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/promo-codes', label: 'Promo Codes', icon: Tag },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
];

export default function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-black tracking-tight mb-8">ADMIN</h1>
      <div className="flex gap-8">
        <aside className="hidden md:block w-48 shrink-0">
          <nav className="space-y-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  (l.exact ? pathname === l.to : pathname.startsWith(l.to) && !l.exact) ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}>
                <l.icon className="h-4 w-4" />{l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0"><Outlet /></div>
      </div>
    </div>
  );
}
