import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col items-center pt-24 px-6 font-serif">
      <div className="max-w-md w-full space-y-12">
        <h1 className="text-4xl font-black">Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Email</Label>
              <Input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-gray-800 h-12 focus:border-white transition-colors" 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-500">Password</Label>
              <Input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-gray-800 h-12 focus:border-white transition-colors" 
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black hover:bg-gray-200 h-12 font-bold"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Don't have an account? <Link to="/signup" className="text-white underline underline-offset-4">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;