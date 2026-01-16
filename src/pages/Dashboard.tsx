import React, { useEffect, useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useDrafts } from '@/hooks/use-drafts';
import DraftListItem from '@/components/DraftListItem';
import { Button } from '@/components/ui/button';
import { Menu, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { drafts, createDraft } = useDrafts();
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
        if (data?.role === 'admin') setIsAdmin(true);
      }
    };
    checkRole();
  }, []);

  const draftEntries = drafts.filter(d => d.status === 'draft');
  const publishedEntries = drafts.filter(d => d.status === 'published');

  const handleCreateAndNavigate = async () => {
    const newId = await createDraft();
    if (newId) navigate(`/editor/${newId}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="p-6 flex justify-between items-center border-b border-border/50">
        <div className="flex items-center space-x-4">
          <div className="w-4 h-4 rounded-full border border-foreground"></div>
          <h1 className="text-4xl font-extrabold tracking-tight">Ideas</h1>
        </div>
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <Button 
              variant="outline" 
              className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2"
              onClick={() => navigate('/admin')}
            >
              <Shield className="h-4 w-4" /> Admin Panel
            </Button>
          )}
          <Button 
            variant="outline" 
            className="rounded-full border-foreground/50 text-sm font-normal hover:bg-accent"
            onClick={handleCreateAndNavigate}
          >
            new entry
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full border border-foreground/50">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        <div className="w-1/2 p-12 border-r border-border/50 overflow-y-auto">
          <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-4">Drafts</h2>
          
          {draftEntries.length > 0 && (
            <div className="space-y-2">
              {draftEntries.map(draft => (
                <DraftListItem key={draft.id} draft={draft} />
              ))}
            </div>
          )}
          
          {draftEntries.length === 0 && (
            <p className="text-muted-foreground">No drafts yet. Click "new entry" to start writing.</p>
          )}
        </div>

        <div className="w-1/2 p-12 overflow-y-auto">
          <h2 className="text-4xl font-extrabold tracking-tight mb-8">Published</h2>
          
          {publishedEntries.length > 0 && (
            <div className="space-y-2">
              {publishedEntries.map(draft => (
                <DraftListItem key={draft.id} draft={draft} isPublished={true} />
              ))}
            </div>
          )}
          
          {publishedEntries.length === 0 && (
            <p className="text-muted-foreground">No published entries yet.</p>
          )}
        </div>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Dashboard;