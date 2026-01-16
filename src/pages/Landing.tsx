import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registration successful! Check your email for verification.');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col items-center pt-24 px-6 font-serif">
      <div className="max-w-2xl w-full space-y-16 pb-24">
        <div className="space-y-6">
          <h1 className="text-8xl font-black tracking-tighter">Hello.</h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
            <span className="text-white font-bold">Wr1te Pages</span> is a modern writing platform designed to focus on writing with distraction free text editor. It's free on it's beta state.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-12">
          <div className="space-y-8">
            <div className="space-y-1.5">
              <Label className="text-sm font-bold uppercase tracking-widest text-gray-500">Email address</Label>
              <Input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-t-0 border-x-0 border-b-2 border-gray-800 rounded-none px-0 text-2xl focus-visible:ring-0 focus-visible:border-white transition-colors h-14" 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-bold uppercase tracking-widest text-gray-500">Password</Label>
              <Input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-t-0 border-x-0 border-b-2 border-gray-800 rounded-none px-0 text-2xl focus-visible:ring-0 focus-visible:border-white transition-colors h-14" 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-bold uppercase tracking-widest text-gray-500">Confirm Password</Label>
              <Input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-transparent border-t-0 border-x-0 border-b-2 border-gray-800 rounded-none px-0 text-2xl focus-visible:ring-0 focus-visible:border-white transition-colors h-14" 
              />
            </div>
          </div>

          <div className="pt-8 space-y-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-transparent border border-white text-white hover:bg-white hover:text-black rounded px-8 py-6 text-xl transition-all h-auto"
            >
              {loading ? 'Signing up...' : 'Sign up →'}
            </Button>
            <p className="text-xs text-gray-600 max-w-sm">
              By clicking "Sign up", you are agreeing to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </form>
      </div>

      <footer className="w-full max-w-6xl py-8 mt-auto flex justify-between text-[10px] uppercase tracking-widest text-gray-600 border-t border-gray-900">
        <div className="flex space-x-6">
          <Link to="/" className="hover:text-white">Wr1te</Link>
          <Link to="#" className="hover:text-white">About</Link>
          <Link to="#" className="hover:text-white">Support</Link>
          <Link to="#" className="hover:text-white">Terms</Link>
          <Link to="#" className="hover:text-white">Privacy</Link>
        </div>
        <div className="flex space-x-6">
          <Link to="/login" className="hover:text-white text-white">Log in</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;