import { Link, Outlet, useLocation } from "react-router-dom";
import { Boxes, FolderTree, LayoutDashboard, Package, ShoppingCart, Tag } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/promo-codes", label: "Promo Codes", icon: Tag },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
];

export default function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <div className="container py-8 md:py-10">
      <h1 className="display-title mb-6 text-3xl sm:text-4xl">Admin</h1>
      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="soft-panel h-fit p-2">
          <nav className="flex gap-1 overflow-x-auto md:block">
            {links.map(link => {
              const isActive = link.exact ? pathname === link.to : pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="soft-panel min-h-[300px] p-5 sm:p-6">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
