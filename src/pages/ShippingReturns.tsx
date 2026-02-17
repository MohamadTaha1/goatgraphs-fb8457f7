import { useEffect } from 'react';

export default function ShippingReturns() {
  useEffect(() => { document.title = 'Shipping & Returns – GoatGraphs'; }, []);
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-black tracking-tight mb-8">SHIPPING & RETURNS</h1>
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3">Shipping</h2>
          <div className="text-muted-foreground space-y-2">
            <p>We offer two shipping methods:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Standard Shipping (5-7 business days):</strong> $9.99, free on orders over $150</li>
              <li><strong>Express Shipping (2-3 business days):</strong> $15.00</li>
            </ul>
            <p>International shipping is available. Rates and delivery times vary by destination.</p>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-3">Returns</h2>
          <div className="text-muted-foreground space-y-2">
            <p>We accept returns within 30 days of delivery for unworn items in original condition with all tags attached.</p>
            <p>To initiate a return, please contact our support team via the Contact page. Return shipping costs are the buyer's responsibility unless the item was received defective or incorrect.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
