import React, { useEffect, useState } from 'react';
import { useDrafts } from '@/hooks/use-drafts';
import DraftListItem from '@/components/DraftListItem';
import { Button } from '@/components/ui/button';
import { Plus, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserMenu } from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';

const Dashboard = () => {
  const { drafts, createDraft, deleteDraft } = useDrafts();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');

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

  const handleCreate = async () => {
    const newId = await createDraft();
    if (newId) {
      if (quickTitle) {
        // Potentially update with title here if desired, but for now just navigate
      }
      navigate(`/editor/${newId}`);
    }
  };

  const draftEntries = drafts.filter(d => d.status === 'draft');
  const publishedEntries = drafts.filter(d => d.status === 'published');

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10">
      <div className="max-w-[1400px] mx-auto flex min-h-screen">
        {/* Left Column - Ideas */}
        <div className="flex-1 border-r border-border/40 p-12 md:p-16">
          <header className="flex items-start justify-between mb-20">
            <div className="flex items-center space-x-12">
              <div className="w-12 h-12 rounded-full border-4 border-foreground shrink-0" />
              <h1 className="text-7xl font-bold tracking-tighter">Ideas</h1>
            </div>
            <button 
              onClick={handleCreate}
              className="px-6 py-2 rounded-full border border-foreground/10 text-xs font-medium tracking-wide hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              new entry
            </button>
          </header>

          <section className="max-w-xl ml-24">
            <div className="mb-16 group">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-3">New Idea</p>
              <div className="flex items-start space-x-3">
                <div className="w-[3px] h-8 bg-foreground/20 group-focus-within:bg-foreground transition-colors" />
                <input 
                  type="text"
                  placeholder="Start typing an idea title here..."
                  className="bg-transparent border-none text-3xl font-light italic tracking-tight placeholder:text-foreground/20 focus:outline-none w-full"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
            </div>

            <div className="space-y-1">
              {draftEntries.map(draft => (
                <DraftListItem key={draft.id} draft={draft} onDelete={deleteDraft} />
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Published */}
        <div className="w-1/3 p-12 md:p-16 bg-black/[0.01] dark:bg-white/[0.01]">
          <header className="flex items-center justify-between mb-20 h-12">
            <h2 className="text-4xl font-light tracking-tight text-foreground/20">Published</h2>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <UserMenu isAdmin={isAdmin} />
            </div>
          </header>

          <section className="space-y-1">
            {publishedEntries.map(draft => (
              <DraftListItem key={draft.id} draft={draft} isPublished onDelete={deleteDraft} />
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;