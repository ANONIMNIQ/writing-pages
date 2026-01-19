import React, { useEffect, useState, useCallback } from 'react';
import { useDrafts } from '@/hooks/use-drafts';
import DraftListItem from '@/components/DraftListItem';
import DraftSkeleton from '@/components/DraftSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Header } from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MAX_TITLE_LENGTH = 30;

const Dashboard = () => {
  const { drafts, loading, createDraft, deleteDraft, updateDraft } = useDrafts();
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

  const handleQuickCreate = useCallback(async () => {
    const trimmedTitle = quickTitle.trim();
    if (trimmedTitle.length === 0) {
      toast.error("Title cannot be empty.");
      return;
    }

    const newId = await createDraft();
    if (newId) {
      await updateDraft(newId, { title: trimmedTitle });
      setQuickTitle('');
      navigate(`/editor/${newId}`);
    } else {
      toast.error("Failed to create new draft.");
    }
  }, [quickTitle, createDraft, updateDraft, navigate]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_TITLE_LENGTH) {
      setQuickTitle(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickCreate();
    }
  };

  const draftEntries = drafts.filter(d => d.status === 'draft');
  const publishedEntries = drafts.filter(d => d.status === 'published');

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/10 flex flex-col">
      <Header isAdmin={isAdmin} />
      
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto">
        {/* Left Column: Ideas */}
        <section className="flex-1 border-b lg:border-b-0 lg:border-r border-border/40 p-8 md:p-12 lg:p-24 overflow-y-auto">
          <header className="flex items-start justify-between mb-16 lg:mb-24">
            <div className="flex items-center space-x-6 md:space-x-10">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-foreground shrink-0" />
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter">Ideas</h1>
            </div>
          </header>

          <div className="max-w-xl lg:ml-20">
            <div className="mb-12 lg:mb-20 group">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-4">Draft an idea...</p>
              <div className="flex items-start space-x-4">
                <div className="w-[2px] h-7 md:h-9 bg-foreground/10 group-focus-within:bg-foreground transition-colors" />
                <input 
                  type="text"
                  placeholder="What's on your mind?"
                  className="bg-transparent border-none text-2xl md:text-4xl font-light italic tracking-tight placeholder:text-foreground/10 focus:outline-none w-full py-0"
                  value={quickTitle}
                  onChange={handleTitleChange}
                  onKeyDown={handleKeyDown}
                  maxLength={MAX_TITLE_LENGTH}
                />
              </div>
              <p className="text-right text-xs text-foreground/30 mt-1">
                {quickTitle.length}/{MAX_TITLE_LENGTH}
              </p>
            </div>

            <div className="space-y-1">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <DraftSkeleton key={i} />)
              ) : draftEntries.length > 0 ? (
                draftEntries.map(draft => (
                  <DraftListItem key={draft.id} draft={draft} onDelete={deleteDraft} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground/40 italic">No drafts yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Published */}
        <section className="w-full lg:w-[35%] min-w-[300px] p-8 md:p-12 lg:p-24 bg-black/[0.01] dark:bg-white/[0.01] overflow-y-auto">
          <header className="flex items-center justify-between mb-12 lg:mb-24 h-10">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-foreground/20">Published</h2>
          </header>

          <div className="space-y-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <DraftSkeleton key={i} />)
            ) : publishedEntries.length > 0 ? (
              publishedEntries.map(draft => (
                <DraftListItem key={draft.id} draft={draft} isPublished onDelete={deleteDraft} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground/40 italic">Nothing published yet.</p>
            )}
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