import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.title = "Contact - GoatGraphs";
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent", description: "Our team will get back to you shortly." });
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="container py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="display-title text-center text-4xl sm:text-5xl">Contact Us</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">Questions about orders, shipping, or stock availability.</p>

        <form onSubmit={handleSubmit} className="soft-panel mt-6 space-y-4 p-6">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea rows={5} value={message} onChange={e => setMessage(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">Send Message</Button>
        </form>
      </div>
    </div>
  );
}
