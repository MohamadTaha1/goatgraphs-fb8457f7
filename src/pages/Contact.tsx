import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Contact() {
  const { toast } = useToast();
  useEffect(() => { document.title = 'Contact – GoatGraphs'; }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Message sent!', description: 'We\'ll get back to you soon.' });
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <h1 className="text-4xl font-black tracking-tight mb-8 text-center">CONTACT US</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><Label>Name</Label><Input required /></div>
        <div><Label>Email</Label><Input type="email" required /></div>
        <div><Label>Subject</Label><Input required /></div>
        <div><Label>Message</Label><Textarea rows={5} required /></div>
        <Button type="submit" className="w-full">Send Message</Button>
      </form>
    </div>
  );
}
