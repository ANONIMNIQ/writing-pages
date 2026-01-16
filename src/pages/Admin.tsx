import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, Shield, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Admin = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if current user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        toast.error("Access denied. Admin privileges required.");
        navigate('/');
        return;
      }

      // Fetch all user profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        toast.error("Failed to fetch users");
      } else {
        setUsers(profiles || []);
      }
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [navigate]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground animate-pulse">Verifying privileges...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="p-2 hover:bg-accent rounded-full transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                Admin Panel
              </h1>
              <p className="text-muted-foreground">Manage registered users of Wr1te Pages</p>
            </div>
          </div>
        </header>

        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold">{user.username || 'No username'}</div>
                        <div className="text-xs text-muted-foreground">{user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      user.role === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Manage</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Admin;