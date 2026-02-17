import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type PromoForm = {
  id?: string;
  code: string;
  type: string;
  value: string;
  min_order: string;
  expires_at: string;
  is_active: boolean;
};

const emptyForm: PromoForm = {
  code: "",
  type: "percentage",
  value: "",
  min_order: "",
  expires_at: "",
  is_active: true,
};

export default function PromoCodes() {
  const [promos, setPromos] = useState<any[]>([]);
  const [form, setForm] = useState<PromoForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const { toast } = useToast();

  const load = () => supabase.from("promo_codes").select("*").order("created_at", { ascending: false }).then(({ data }) => setPromos(data || []));

  useEffect(() => {
    document.title = "Promo Codes - Admin";
    load();
  }, []);

  const save = async () => {
    if (!form.code || !form.value) return;
    const payload = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: Number(form.value),
      min_order: form.min_order ? Number(form.min_order) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase.from("promo_codes").update(payload).eq("id", editingId);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
      else toast({ title: "Promo code updated" });
    } else {
      const { error } = await supabase.from("promo_codes").insert(payload);
      if (error) toast({ title: "Create failed", description: error.message, variant: "destructive" });
      else toast({ title: "Promo code added" });
    }
    setForm(emptyForm);
    setEditingId("");
    load();
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else toast({ title: "Promo code deleted" });
    load();
  };

  const sortedPromos = useMemo(
    () =>
      promos.map(promo => ({
        ...promo,
        expired: promo.expires_at ? new Date(promo.expires_at).getTime() < Date.now() : false,
      })),
    [promos],
  );

  return (
    <div>
      <h2 className="text-2xl font-bold">Promo Codes</h2>
      <p className="mt-1 text-sm text-muted-foreground">Manage discounts with activation flags, minimum order, and expiry.</p>

      <div className="mt-5 rounded-xl border border-border p-4">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          <Input placeholder="CODE" value={form.code} onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))} />
          <Select value={form.type} onValueChange={value => setForm(prev => ({ ...prev, type: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed ($)</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Value" value={form.value} onChange={e => setForm(prev => ({ ...prev, value: e.target.value }))} />
          <Input type="number" placeholder="Min order (optional)" value={form.min_order} onChange={e => setForm(prev => ({ ...prev, min_order: e.target.value }))} />
          <Input type="datetime-local" value={form.expires_at} onChange={e => setForm(prev => ({ ...prev, expires_at: e.target.value }))} />
          <label className="flex items-center gap-2 rounded-md border border-border px-3">
            <Switch checked={form.is_active} onCheckedChange={value => setForm(prev => ({ ...prev, is_active: value }))} />
            <span className="text-sm font-semibold">Active</span>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={save}>
            <Plus className="mr-2 h-4 w-4" />
            {editingId ? "Update Promo" : "Add Promo"}
          </Button>
          {editingId && <Button variant="outline" onClick={() => { setEditingId(""); setForm(emptyForm); }}>Cancel</Button>}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {sortedPromos.map(promo => (
          <div key={promo.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
            <div>
              <p className="font-mono text-sm font-bold">{promo.code}</p>
              <p className="text-xs text-muted-foreground">
                {promo.type === "percentage" ? `${promo.value}%` : `$${promo.value}`} off
                {promo.min_order ? ` | Min order: $${promo.min_order}` : ""}
                {promo.expires_at ? ` | Expires: ${new Date(promo.expires_at).toLocaleString()}` : ""}
              </p>
              <p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${promo.is_active && !promo.expired ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                {promo.is_active ? promo.expired ? "Expired" : "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingId(promo.id);
                  setForm({
                    id: promo.id,
                    code: promo.code,
                    type: promo.type,
                    value: String(promo.value),
                    min_order: promo.min_order ? String(promo.min_order) : "",
                    expires_at: promo.expires_at ? new Date(promo.expires_at).toISOString().slice(0, 16) : "",
                    is_active: promo.is_active,
                  });
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => del(promo.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {!sortedPromos.length && <p className="py-8 text-center text-sm text-muted-foreground">No promo codes found.</p>}
      </div>
    </div>
  );
}
