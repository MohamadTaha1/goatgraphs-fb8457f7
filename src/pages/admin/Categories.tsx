import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TYPES = ['team', 'league', 'country', 'season', 'jersey_type'] as const;

export default function Categories() {
  const [cats, setCats] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('team');
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();

  const load = () => supabase.from('categories').select('*').order('type').order('name').then(({ data }) => setCats(data || []));
  useEffect(() => { document.title = 'Categories – Admin'; load(); }, []);

  const add = async () => {
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { error } = await supabase.from('categories').insert({ name, slug, type: type as any });
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Category added!' });
    setName('');
    load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    await supabase.from('categories').delete().eq('id', id);
    toast({ title: 'Deleted' });
    load();
  };

  const filtered = filterType === 'all' ? cats : cats.filter(c => c.type === filterType);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Categories</h2>
      <div className="flex gap-2 mb-6">
        <Input placeholder="Category name" value={name} onChange={e => setName(e.target.value)} className="flex-1" />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={add}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>
      <div className="flex gap-2 mb-4">
        <Button variant={filterType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('all')}>All</Button>
        {TYPES.map(t => <Button key={t} variant={filterType === t ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(t)} className="capitalize">{t.replace('_', ' ')}</Button>)}
      </div>
      <div className="space-y-2">
        {filtered.map(c => (
          <div key={c.id} className="flex items-center justify-between border border-border rounded p-3">
            <div><span className="font-medium text-sm">{c.name}</span> <span className="text-xs text-muted-foreground ml-2 capitalize">{c.type.replace('_', ' ')}</span></div>
            <Button variant="ghost" size="icon" onClick={() => del(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
        {!filtered.length && <p className="text-center text-muted-foreground py-8">No categories yet.</p>}
      </div>
    </div>
  );
}
