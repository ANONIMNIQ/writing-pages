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
    toast.success("Logged out");
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="p-6 flex justify-between items-center border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-4 h-4 rounded-full border-2 border-foreground"></div>
          <h1 className="text-4xl font-black tracking-tighter">Ideas</h1>
        </div>
        <div className="flex items-center space-x-3">
          {isAdmin && (
            <Button variant="outline" asChild className="rounded-full gap-2 border-primary/20 hover:bg-primary/5">
              <Link to="/admin">
                <Shield className="h-4 w-4" />
                Admin Panel
              </Link>
            </Button>
          )}
          <Button 
            className="rounded-full gap-2 font-bold px-6"
            onClick={handleCreateAndNavigate}
          >
            <Plus className="h-4 w-4" />
            new entry
          </Button>
          <div className="w-[1px] h-6 bg-border mx-2" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        <div className="w-1/2 p-12 border-r border-border/50 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Drafts</h2>
            <span className="text-xs font-mono opacity-40">{draftEntries.length} items</span>
          </div>
          
          {draftEntries.length > 0 ? (
            <div className="space-y-1">
              {draftEntries.map(draft => (
                <DraftListItem key={draft.id} draft={draft} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center border-2 border-dashed border-border/50 rounded-2xl">
              <p className="text-muted-foreground text-sm font-serif italic">No drafts yet.</p>
            </div>
          )}
        </div>

        <div className="w-1/2 p-12 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black tracking-tighter">Published</h2>
            <span className="text-xs font-mono opacity-40">{publishedEntries.length} items</span>
          </div>
          
          {publishedEntries.length > 0 ? (
            <div className="space-y-1">
              {publishedEntries.map(draft => (
                <DraftListItem key={draft.id} draft={draft} isPublished={true} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center border-2 border-dashed border-border/50 rounded-2xl">
              <p className="text-muted-foreground text-sm font-serif italic">No published entries yet.</p>
            </div>
          )}
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;