import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type View = "login" | "signup" | "forgot";

export default function Auth() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, resetPassword, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Sign In - GoatGraphs";
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(isAdmin ? "/admin" : "/account", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let error: any;
    if (view === "login") {
      ({ error } = await signIn(email, password));
    } else if (view === "signup") {
      ({ error } = await signUp(email, password, fullName));
      if (!error) {
        toast({ title: "Account created", description: "Check your email to verify your account." });
        setView("login");
        setPassword("");
        setLoading(false);
        return;
      }
    } else {
      ({ error } = await resetPassword(email));
      if (!error) {
        toast({ title: "Reset link sent", description: "Check your email inbox." });
        setView("login");
        setLoading(false);
        return;
      }
    }

    if (error) toast({ title: "Authentication error", description: error.message, variant: "destructive" });
    setLoading(false);
  };

  return (
    <div className="container py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-border/80 bg-white/80 shadow-xl shadow-slate-900/10 backdrop-blur md:grid-cols-2">
        <div className="aurora hidden p-8 text-white md:flex md:flex-col md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/70">Welcome Back</p>
            <h1 className="mt-3 text-4xl font-black leading-tight">Access your matchday account.</h1>
            <p className="mt-4 text-sm text-white/80">Track orders, manage addresses, and save your favorite club and national kits.</p>
          </div>
          <p className="text-xs text-white/70">Secure authentication powered by Supabase.</p>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="display-title text-3xl">
            {view === "login" ? "Sign In" : view === "signup" ? "Create Account" : "Reset Password"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {view === "forgot" ? "Enter your email to receive a password reset link." : "Use your account credentials to continue."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {view === "signup" && (
              <div>
                <Label>Full Name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {view !== "forgot" && (
              <div>
                <Label>Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : view === "login" ? "Sign In" : view === "signup" ? "Create Account" : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 space-y-2 text-sm">
            {view === "login" && (
              <>
                <button type="button" onClick={() => setView("forgot")} className="font-semibold text-primary hover:underline">Forgot password?</button>
                <p className="text-muted-foreground">
                  No account yet?{" "}
                  <button type="button" onClick={() => setView("signup")} className="font-semibold text-primary hover:underline">
                    Sign up
                  </button>
                </p>
              </>
            )}
            {view !== "login" && (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <button type="button" onClick={() => setView("login")} className="font-semibold text-primary hover:underline">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
