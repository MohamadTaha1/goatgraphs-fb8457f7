import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PromoCodes() {
  const [promos, setPromos] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const { toast } = useToast();

  const load = () => supabase.from('promo_codes').select('*').order('created_at', { ascending: false }).then(({ data }) => setPromos(data || []));
  useEffect(() => { document.title = 'Promo Codes – Admin'; load(); }, []);

  const add = async () => {
    if (!code || !value) return;
    const { error } = await supabase.from('promo_codes').insert({ code: code.toUpperCase(), type, value: Number(value) });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Promo code added!' });
    setCode(''); setValue('');
    load();
  };

  const del = async (id: string) => {
    await supabase.from('promo_codes').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Promo Codes</h2>
      <div className="flex gap-2 mb-6">
        <Input placeholder="CODE" value={code} onChange={e => setCode(e.target.value)} className="w-32" />
        <Select value={type} onValueChange={setType}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">%</SelectItem><SelectItem value="fixed">$</SelectItem></SelectContent></Select>
        <Input type="number" placeholder="Value" value={value} onChange={e => setValue(e.target.value)} className="w-24" />
        <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>
      <div className="space-y-2">
        {promos.map(p => (
          <div key={p.id} className="flex items-center justify-between border border-border rounded p-3">
            <div>
              <span className="font-mono font-bold text-sm">{p.code}</span>
              <span className="text-xs text-muted-foreground ml-2">{p.type === 'percentage' ? `${p.value}%` : `$${p.value}`} off</span>
              {!p.is_active && <span className="text-xs text-destructive ml-2">(inactive)</span>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
        {!promos.length && <p className="text-center text-muted-foreground py-8">No promo codes yet.</p>}
      </div>
    </div>
  );
}
