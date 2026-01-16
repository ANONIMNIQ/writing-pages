import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const Landing = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username,
        }
      }
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
            <span className="text-white font-bold">Dyad Writer</span> is a modern publishing platform designed to get out of your way. 
            The first week is free, then it costs $7/mo. Membership comes with the <span className="underline decoration-white underline-offset-4">Forever Promise</span>.
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

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <Label className="text-sm font-bold uppercase tracking-widest text-gray-500">First name</Label>
                <Input 
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-transparent border-t-0 border-x-0 border-b-2 border-gray-800 rounded-none px-0 text-2xl focus-visible:ring-0 focus-visible:border-white transition-colors h-14" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-bold uppercase tracking-widest text-gray-500">Last name</Label>
                <Input 
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-transparent border-t-0 border-x-0 border-b-2 border-gray-800 rounded-none px-0 text-2xl focus-visible:ring-0 focus-visible:border-white transition-colors h-14" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline space-x-1">
                <Input 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-transparent border-t-0 border-x-0 border-b-2 border-gray-800 rounded-none px-0 text-2xl focus-visible:ring-0 focus-visible:border-white transition-colors h-14 w-auto min-w-[120px]" 
                  placeholder="username"
                />
                <span className="text-2xl text-gray-600">.dyad.com</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Your username is also your blog's subdomain.</p>
            </div>
          </div>

          <div className="space-y-8 pt-8">
            <h2 className="text-3xl font-black">Select a plan</h2>
            <RadioGroup defaultValue="monthly" className="grid grid-cols-2 gap-4">
              <div className="border-2 border-gray-800 p-8 rounded-lg flex flex-col items-center space-y-4 hover:border-gray-600 transition-colors cursor-pointer group">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white">Monthly</span>
                <span className="text-2xl font-bold">$7 <span className="text-sm font-normal text-gray-500">/mo</span></span>
                <RadioGroupItem value="monthly" className="border-gray-600" />
              </div>
              <div className="border-2 border-gray-800 p-8 rounded-lg flex flex-col items-center space-y-4 hover:border-gray-600 transition-colors cursor-pointer group">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white">Yearly</span>
                <span className="text-2xl font-bold">$75 <span className="text-sm font-normal text-gray-500">/yr</span></span>
                <RadioGroupItem value="yearly" className="border-gray-600" />
              </div>
            </RadioGroup>
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
          <Link to="/" className="hover:text-white">Dyad</Link>
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