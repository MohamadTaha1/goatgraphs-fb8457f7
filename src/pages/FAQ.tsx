import { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Are all jerseys authentic?", a: "Yes. All inventory is verified before listing and shipped as authentic merchandise only." },
  { q: "What sizes are available?", a: "Variants are listed per product and usually include S, M, L, XL, and XXL depending on stock." },
  { q: "How long is shipping?", a: "Standard delivery is 5-7 business days. Express delivery is 2-3 business days." },
  { q: "What is your return policy?", a: "Returns are accepted for 30 days on unworn items in original condition." },
  { q: "Can I track orders in my account?", a: "Yes. Order history and statuses are visible in the account orders section." },
];

export default function FAQ() {
  useEffect(() => {
    document.title = "FAQ - GoatGraphs";
  }, []);

  return (
    <div className="container py-14">
      <div className="mx-auto max-w-4xl">
        <h1 className="display-title text-4xl sm:text-5xl">FAQ</h1>
        <div className="soft-panel mt-6 p-4 sm:p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, index) => (
              <AccordionItem key={item.q} value={`faq-${index}`}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
