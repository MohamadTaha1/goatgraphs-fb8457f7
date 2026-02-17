import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type View = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { document.title = 'Sign In – GoatGraphs'; }, []);
  useEffect(() => { if (user) navigate('/account'); }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let error: any;
    if (view === 'login') {
      ({ error } = await signIn(email, password));
    } else if (view === 'signup') {
      ({ error } = await signUp(email, password, fullName));
      if (!error) { toast({ title: 'Account created!', description: 'Check your email to verify.' }); setView('login'); setLoading(false); return; }
    } else {
      ({ error } = await resetPassword(email));
      if (!error) { toast({ title: 'Reset link sent', description: 'Check your email.' }); setView('login'); setLoading(false); return; }
    }
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    setLoading(false);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black tracking-tight mb-8 text-center">
          {view === 'login' ? 'SIGN IN' : view === 'signup' ? 'CREATE ACCOUNT' : 'RESET PASSWORD'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'signup' && (
            <div><Label>Full Name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} required /></div>
          )}
          <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          {view !== 'forgot' && (
            <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm space-y-2">
          {view === 'login' && (
            <>
              <button onClick={() => setView('forgot')} className="text-primary hover:underline block mx-auto">Forgot password?</button>
              <p className="text-muted-foreground">Don't have an account? <button onClick={() => setView('signup')} className="text-primary hover:underline">Sign up</button></p>
            </>
          )}
          {view !== 'login' && (
            <p className="text-muted-foreground">Already have an account? <button onClick={() => setView('login')} className="text-primary hover:underline">Sign in</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
