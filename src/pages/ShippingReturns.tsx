import { useEffect } from "react";

export default function ShippingReturns() {
  useEffect(() => {
    document.title = "Shipping & Returns - GoatGraphs";
  }, []);

  return (
    <div className="container py-14">
      <div className="mx-auto max-w-4xl">
        <h1 className="display-title text-4xl sm:text-5xl">Shipping & Returns</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="soft-panel p-6">
            <h2 className="text-2xl font-bold">Shipping</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Standard (5-7 business days): $9.99, free on orders over $150.</li>
              <li>Express (2-3 business days): $15.00.</li>
              <li>International delivery available with destination-based rates.</li>
            </ul>
          </section>
          <section className="soft-panel p-6">
            <h2 className="text-2xl font-bold">Returns</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Returns accepted within 30 days of delivery.</li>
              <li>Items must be unworn with original tags and packaging.</li>
              <li>For return support, contact us from the Contact page.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
