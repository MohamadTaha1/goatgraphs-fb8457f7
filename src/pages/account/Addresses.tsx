import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type AddressForm = {
  id?: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

const emptyAddress: AddressForm = {
  label: "Home",
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "US",
  is_default: false,
};

export default function Addresses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editing, setEditing] = useState<AddressForm>(emptyAddress);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setAddresses(data || []);
  };

  useEffect(() => {
    load();
  }, [user]);

  const hasRequired = useMemo(() => editing.full_name && editing.address_line1 && editing.city && editing.postal_code && editing.country, [editing]);

  const setDefaultAddress = async (id: string) => {
    if (!user) return;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    toast({ title: "Default address updated" });
    load();
  };

  const save = async () => {
    if (!user || !hasRequired) return;
    setLoading(true);
    if (editing.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    }

    const payload = {
      user_id: user.id,
      label: editing.label || "Address",
      full_name: editing.full_name,
      phone: editing.phone || null,
      address_line1: editing.address_line1,
      address_line2: editing.address_line2 || null,
      city: editing.city,
      state: editing.state || null,
      postal_code: editing.postal_code,
      country: editing.country || "US",
      is_default: editing.is_default,
    };

    if (editing.id) {
      const { error } = await supabase.from("addresses").update(payload).eq("id", editing.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Address updated" });
    } else {
      const { error } = await supabase.from("addresses").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Address added" });
    }

    setLoading(false);
    setEditing(emptyAddress);
    setOpenForm(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    toast({ title: "Address removed" });
    load();
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold">Addresses</h2>
          <p className="text-sm text-muted-foreground">Manage shipping addresses used at checkout.</p>
        </div>
        <Button onClick={() => { setOpenForm(true); setEditing(emptyAddress); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {addresses.map(addr => (
          <div key={addr.id} className="rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold">{addr.label || "Address"}</p>
                <p className="text-sm font-semibold">{addr.full_name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}
                  <br />
                  {addr.city}, {addr.state} {addr.postal_code}
                  <br />
                  {addr.country}
                </p>
                {addr.phone && <p className="mt-1 text-xs text-muted-foreground">Phone: {addr.phone}</p>}
              </div>
              <div className="space-y-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing({
                      id: addr.id,
                      label: addr.label || "Address",
                      full_name: addr.full_name || "",
                      phone: addr.phone || "",
                      address_line1: addr.address_line1 || "",
                      address_line2: addr.address_line2 || "",
                      city: addr.city || "",
                      state: addr.state || "",
                      postal_code: addr.postal_code || "",
                      country: addr.country || "US",
                      is_default: !!addr.is_default,
                    });
                    setOpenForm(true);
                  }}
                >
                  Edit
                </Button>
                {!addr.is_default && (
                  <Button size="sm" variant="ghost" onClick={() => setDefaultAddress(addr.id)}>
                    Set default
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(addr.id)}>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
            {addr.is_default && <p className="mt-3 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Default</p>}
          </div>
        ))}
      </div>

      {!addresses.length && !openForm && <p className="py-8 text-center text-sm text-muted-foreground">No addresses yet.</p>}

      {openForm && (
        <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
          <h3 className="text-lg font-bold">{editing.id ? "Edit Address" : "New Address"}</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Label</Label>
              <Input value={editing.label} onChange={e => setEditing(prev => ({ ...prev, label: e.target.value }))} />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input value={editing.full_name} onChange={e => setEditing(prev => ({ ...prev, full_name: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label>Phone</Label>
              <Input value={editing.phone} onChange={e => setEditing(prev => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label>Address Line 1</Label>
              <Input value={editing.address_line1} onChange={e => setEditing(prev => ({ ...prev, address_line1: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label>Address Line 2</Label>
              <Input value={editing.address_line2} onChange={e => setEditing(prev => ({ ...prev, address_line2: e.target.value }))} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={editing.city} onChange={e => setEditing(prev => ({ ...prev, city: e.target.value }))} />
            </div>
            <div>
              <Label>State</Label>
              <Input value={editing.state} onChange={e => setEditing(prev => ({ ...prev, state: e.target.value }))} />
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input value={editing.postal_code} onChange={e => setEditing(prev => ({ ...prev, postal_code: e.target.value }))} />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={editing.country} onChange={e => setEditing(prev => ({ ...prev, country: e.target.value }))} />
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={editing.is_default} onCheckedChange={v => setEditing(prev => ({ ...prev, is_default: Boolean(v) }))} />
            Set as default
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={save} disabled={!hasRequired || loading}>{loading ? "Saving..." : editing.id ? "Update Address" : "Add Address"}</Button>
            <Button variant="outline" onClick={() => { setOpenForm(false); setEditing(emptyAddress); }}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
