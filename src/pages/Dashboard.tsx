import React, { useEffect, useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useDrafts } from '@/hooks/use-drafts';
import DraftListItem from '@/components/DraftListItem';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserMenu } from '@/components/UserMenu';
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
      <header className="p-6 flex justify-between items-center border-b border-border/50">
        <div className="flex items-center space-x-4">
          <div className="w-4 h-4 rounded-full border border-foreground"></div>
          <h1 className="text-4xl font-extrabold tracking-tight">Ideas</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="rounded-full border-foreground/50 text-sm font-normal hover:bg-accent"
            onClick={handleCreateAndNavigate}
          >
            new entry
          </Button>
          <UserMenu isAdmin={isAdmin} />
        </div>
      </header>

      <div className="flex flex-1">
        <div className="w-1/2 p-12 border-r border-border/50 overflow-y-auto">
          <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-4">Drafts</h2>
          
          {draftEntries.length > 0 ? (
            <div className="space-y-1">
              {draftEntries.map(draft => (
                <DraftListItem key={draft.id} draft={draft} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm font-serif italic">No drafts yet.</p>
          )}
        </div>

        <div className="w-1/2 p-12 overflow-y-auto">
          <h2 className="text-4xl font-extrabold tracking-tight mb-8">Published</h2>
          
          {publishedEntries.length > 0 ? (
            <div className="space-y-1">
              {publishedEntries.map(draft => (
                <DraftListItem key={draft.id} draft={draft} isPublished={true} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm font-serif italic">No published entries yet.</p>
          )}
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;