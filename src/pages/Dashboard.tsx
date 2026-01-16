import React, { useEffect, useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useDrafts } from '@/hooks/use-drafts';
import DraftListItem from '@/components/DraftListItem';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserMenu } from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';

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

  const draftEntries = drafts.filter(d => d.status === 'draft');
  const publishedEntries = drafts.filter(d => d.status === 'published');

  const handleCreateAndNavigate = async () => {
    const newId = await createDraft();
    if (newId) navigate(`/editor/${newId}`);
  };

  const handleDelete = async (id: string) => {
    await deleteDraft(id);
    toast.success("Entry removed");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-serif selection:bg-primary/10">
      <header className="px-8 py-6 flex justify-between items-center border-b border-border/30 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3 group cursor-default">
          <div className="w-2 h-2 rounded-full bg-primary group-hover:scale-150 transition-transform duration-500"></div>
          <h1 className="text-2xl font-bold tracking-tight">Wr1te</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button 
            variant="outline"
            className="rounded-full border-border/50 hover:bg-accent gap-2 h-10 px-4 font-medium"
            onClick={handleCreateAndNavigate}
          >
            <Plus className="h-4 w-4" />
            <span>New Entry</span>
          </Button>
          <div className="w-[1px] h-4 bg-border/50 mx-2" />
          <UserMenu isAdmin={isAdmin} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full px-8 py-16 flex-1">
        <section className="mb-20">
          <header className="flex items-baseline justify-between mb-8 border-b border-border/20 pb-2">
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Drafts</h2>
            <span className="text-[10px] font-mono opacity-20">{draftEntries.length} items</span>
          </header>
          
          {draftEntries.length > 0 ? (
            <div className="divide-y divide-border/5">
              {draftEntries.map(draft => (
                <DraftListItem key={draft.id} draft={draft} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground/40 italic text-sm">Empty space for new ideas.</p>
            </div>
          )}
        </section>

        <section>
          <header className="flex items-baseline justify-between mb-8 border-b border-border/20 pb-2">
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] opacity-40">Published</h2>
            <span className="text-[10px] font-mono opacity-20">{publishedEntries.length} items</span>
          </header>
          
          {publishedEntries.length > 0 ? (
            <div className="divide-y divide-border/5">
              {publishedEntries.map(draft => (
                <DraftListItem key={draft.id} draft={draft} isPublished={true} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground/40 italic text-sm">Nothing shared with the world yet.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-auto opacity-50 hover:opacity-100 transition-opacity">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Dashboard;