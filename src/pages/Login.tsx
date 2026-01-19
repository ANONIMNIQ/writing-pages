import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import FloatingInput from '@/components/FloatingInput';

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
      <div className="max-w-md w-full space-y-16">
        <h1 className="text-6xl font-black tracking-tighter">Login.</h1>
        
        <form onSubmit={handleLogin} className="space-y-12">
          <div className="space-y-4">
            <FloatingInput 
              label="Email address"
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <FloatingInput 
              label="Password"
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-8 space-y-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-transparent border border-white text-white hover:bg-white hover:text-black rounded px-8 py-6 text-xl transition-all h-auto w-full sm:w-auto"
            >
              {loading ? 'Logging in...' : 'Log In →'}
            </Button>
            <p className="text-center sm:text-left text-sm text-gray-500">
              Don't have an account? <Link to="/signup" className="text-white underline underline-offset-4">Sign up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;