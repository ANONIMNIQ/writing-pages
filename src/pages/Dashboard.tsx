import React, { useEffect, useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useDrafts } from '@/hooks/use-drafts';
import DraftListItem from '@/components/DraftListItem';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Plus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Dashboard = () => {
  const { drafts, createDraft, deleteDraft } = useDrafts();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (data?.role === 'admin') {
          setIsAdmin(true);
        }
      }
    };
    checkRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    toast.success("Successfully logged out");
  };

  const draftEntries = drafts.filter(d => d.status === 'draft');
  const publishedEntries = drafts.filter(d => d.status === 'published');

  const handleCreateAndNavigate = async () => {
    const newId = await createDraft();
    if (newId) navigate(`/editor/${newId}`);
  };

  const handleDelete = async (id: string) => {
    await deleteDraft(id);
    toast.success("Entry deleted");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-serif">
      <header className="p-8 flex justify-between items-center border-b-4 border-primary bg-background sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-6">
          <div className="w-8 h-8 bg-primary rounded-sm rotate-45"></div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">Wr1te</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button variant="outline" asChild className="rounded-full border-2 font-bold px-6">
              <Link to="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </Button>
          )}
          
          <Button 
            className="rounded-full bg-primary text-primary-foreground font-black px-8 py-6 text-lg shadow-lg hover:scale-105 transition-transform"
            onClick={handleCreateAndNavigate}
          >
            <Plus className="mr-2 h-6 w-6" />
            NEW ENTRY
          </Button>

          <div className="h-10 w-[2px] bg-border mx-2" />

          <Button 
            variant="ghost" 
            className="rounded-full text-red-600 hover:text-white hover:bg-red-600 font-bold px-6 border-2 border-red-600/20"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            LOG OUT
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-12 space-y-24">
        <section>
          <div className="flex items-end justify-between mb-12 border-b-2 border-border pb-4">
            <h2 className="text-6xl font-black uppercase tracking-tighter">Drafts</h2>
            <p className="text-xl text-muted-foreground font-mono">{draftEntries.length} items</p>
          </div>
          
          {draftEntries.length > 0 ? (
            <div className="grid gap-4">
              {draftEntries.map(draft => (
                <DraftListItem key={draft.id} draft={draft} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-4 border-dashed border-border rounded-3xl">
              <p className="text-3xl text-muted-foreground italic">You haven't started any drafts yet.</p>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-end justify-between mb-12 border-b-2 border-border pb-4">
            <h2 className="text-6xl font-black uppercase tracking-tighter text-primary">Published</h2>
            <p className="text-xl text-muted-foreground font-mono">{publishedEntries.length} items</p>
          </div>
          
          {publishedEntries.length > 0 ? (
            <div className="grid gap-4">
              {publishedEntries.map(draft => (
                <DraftListItem key={draft.id} draft={draft} isPublished={true} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-4 border-dashed border-border rounded-3xl">
              <p className="text-3xl text-muted-foreground italic">Nothing published yet.</p>
            </div>
          )}
        </section>
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;