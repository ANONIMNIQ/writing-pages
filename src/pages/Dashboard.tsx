import React, { useEffect, useState } from 'react';
import { useDrafts } from '@/hooks/use-drafts';
import DraftListItem from '@/components/DraftListItem';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserMenu } from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MadeWithDyad } from '@/components/made-with-dyad';

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
      navigate(`/editor/${newId}`);
    }
  };

  const draftEntries = drafts.filter(d => d.status === 'draft');
  const publishedEntries = drafts.filter(d => d.status === 'published');

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10 flex flex-col">
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* Left Column: Ideas */}
        <section className="flex-1 border-r border-border/40 p-12 md:p-16 lg:p-24 overflow-y-auto">
          <header className="flex items-start justify-between mb-24">
            <div className="flex items-center space-x-10">
              {/* Svbtle Dot Logo */}
              <div className="w-10 h-10 rounded-full bg-foreground shrink-0" />
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter">Ideas</h1>
            </div>
            <button 
              onClick={handleCreate}
              className="px-5 py-1.5 rounded-full border border-foreground/20 text-[10px] uppercase font-bold tracking-widest hover:bg-foreground hover:text-background transition-all duration-300"
            >
              new entry
            </button>
          </header>

          <div className="max-w-xl ml-20">
            {/* Quick Title Input */}
            <div className="mb-20 group">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-4">Draft an idea...</p>
              <div className="flex items-start space-x-4">
                <div className="w-[2px] h-9 bg-foreground/10 group-focus-within:bg-foreground transition-colors" />
                <input 
                  type="text"
                  placeholder="What's on your mind?"
                  className="bg-transparent border-none text-4xl font-light italic tracking-tight placeholder:text-foreground/10 focus:outline-none w-full py-0"
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
          </div>
        </section>

        {/* Right Column: Published */}
        <section className="w-[35%] min-w-[350px] p-12 md:p-16 lg:p-24 bg-black/[0.01] dark:bg-white/[0.01] overflow-y-auto">
          <header className="flex items-center justify-between mb-24 h-10">
            <h2 className="text-4xl font-light tracking-tight text-foreground/20">Published</h2>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <UserMenu isAdmin={isAdmin} />
            </div>
          </header>

          <div className="space-y-1">
            {publishedEntries.map(draft => (
              <DraftListItem key={draft.id} draft={draft} isPublished onDelete={deleteDraft} />
            ))}
          </div>
        </section>
      </div>
      
      <footer className="py-4 border-t border-border/10 opacity-30 hover:opacity-100 transition-opacity">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Dashboard;