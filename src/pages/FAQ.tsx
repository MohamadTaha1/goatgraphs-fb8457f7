import { useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  { q: 'Are all jerseys authentic?', a: 'Yes, every jersey sold on GoatGraphs is 100% authentic. We source directly from official suppliers and verified collectors.' },
  { q: 'What sizes do you offer?', a: 'We offer sizes S, M, L, XL, and XXL. Size availability varies by product.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available at checkout.' },
  { q: 'Can I return a jersey?', a: 'Yes, we offer a 30-day return policy for unworn items in original condition with tags attached.' },
  { q: 'Do you ship internationally?', a: 'Yes, we ship worldwide. International shipping times and costs vary by destination.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you\'ll receive a tracking number via email. You can also check your order status in your account.' },
];

export default function FAQ() {
  useEffect(() => { document.title = 'FAQ – GoatGraphs'; }, []);
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-4xl font-black tracking-tight mb-8">FAQ</h1>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent><p className="text-muted-foreground">{f.a}</p></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
