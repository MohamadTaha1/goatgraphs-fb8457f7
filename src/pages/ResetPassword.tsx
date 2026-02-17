import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Reset Password - GoatGraphs";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await updatePassword(password);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Password updated" });
      navigate("/account/profile");
    }
    setLoading(false);
  };

  return (
    <div className="container py-16">
      <div className="soft-panel mx-auto max-w-md p-6">
        <h1 className="display-title text-3xl">New Password</h1>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <Label>New Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
