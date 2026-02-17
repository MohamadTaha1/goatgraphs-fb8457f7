import { Link } from 'react-router-dom';

const footerLinks = [
  { title: 'Shop', links: [
    { label: 'All Jerseys', href: '/shop' },
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'Teams', href: '/shop/team/all' },
    { label: 'Leagues', href: '/shop/league/all' },
  ]},
  { title: 'Support', links: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Shipping & Returns', href: '/shipping-returns' },
    { label: 'Contact Us', href: '/contact' },
  ]},
  { title: 'Company', links: [
    { label: 'About', href: '/about' },
  ]},
];

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-black text-xl mb-4">GOATGRAPHS</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Premium authentic football jerseys. Every shirt tells a story.
            </p>
          </div>
          {footerLinks.map(section => (
            <div key={section.title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 opacity-50">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm opacity-70 hover:opacity-100 transition-opacity">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-background/10 mt-12 pt-8 text-center text-xs opacity-50">
          © {new Date().getFullYear()} GoatGraphs. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
