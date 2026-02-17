import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", user.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Profile updated" });
      await refreshProfile();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold">Profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">Manage your personal details used across checkout and orders.</p>

      <div className="mt-5 space-y-4">
        <div>
          <Label>Email</Label>
          <Input value={user?.email || ""} disabled />
        </div>
        <div>
          <Label>Full Name</Label>
          <Input value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save Profile"}</Button>
        <Button variant="outline" onClick={signOut}>Sign Out</Button>
      </div>
    </div>
  );
}
