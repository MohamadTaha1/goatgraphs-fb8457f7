import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Shop",
    links: [
      { label: "All Jerseys", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Teams", href: "/shop/team/all" },
      { label: "Leagues", href: "/shop/league/all" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [{ label: "About", href: "/about" }],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-foreground text-background">
      <div className="container py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <h3 className="mb-4 text-xl font-black">GOATGRAPHS</h3>
            <p className="text-sm leading-relaxed text-background/70">Premium authentic football jerseys. Every shirt tells a story.</p>
          </div>

          {footerLinks.map(section => (
            <div key={section.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-background/50">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-background/75 transition-colors hover:text-background">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-background/10 pt-6 text-center text-xs text-background/50">
          (c) {new Date().getFullYear()} GoatGraphs. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
