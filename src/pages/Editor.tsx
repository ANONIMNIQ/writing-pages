import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDrafts } from '@/hooks/use-drafts';
import { Button } from '@/components/ui/button';
import { Keyboard, ChevronLeft, Plus } from 'lucide-react';
import ExportOptions from '@/components/ExportOptions';
import TextFormattingToolbar from '@/components/TextFormattingToolbar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { supabase } from '@/integrations/supabase/client';

const turndownService = new TurndownService();
const LINE_HEIGHT = 32;
const FOCUS_OFFSET_VH = 40; 

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDraft, updateDraft } = useDrafts();
  
  const [draftData, setDraftData] = useState<any>(null);
  const [title, setTitle] = useState('Title');
  const [contentHtml, setContentHtml] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [plusButtonTop, setPlusButtonTop] = useState<number | null>(null);
  const [isTypewriterMode, setIsTypewriterMode] = useState(false);
  const [typewriterOffset, setTypewriterOffset] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const isContentInitialized = useRef(false);

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

  // Fetch draft data and initialize content
  useEffect(() => {
    const fetchDraft = async () => {
      if (id) {
        const draft = await getDraft(id);
        if (draft) {
          setDraftData(draft);
          setTitle(draft.title || 'Title');
          const html = marked.parse(draft.content || '') as string;
          setContentHtml(html);
          
          // Initialize contentEditable div only once after fetching data
          if (editorRef.current && !isContentInitialized.current) {
            editorRef.current.innerHTML = html;
            isContentInitialized.current = true;
          }
        } else {
          navigate('/');
          toast.error("Draft not found.");
        }
      }
    };
    fetchDraft();
  }, [id, getDraft, navigate]);

  const updateCaretInfo = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current?.getBoundingClientRect();

    if (editorRect) {
      const relativeTop = rect.top - editorRect.top;
      const caretHeight = rect.height || LINE_HEIGHT;
      if (rect.top > 0) {
        setPlusButtonTop(relativeTop + (caretHeight / 2) - (LINE_HEIGHT / 2));
      }
      if (isTypewriterMode) {
        // Calculate offset to keep caret near the focus line
        const focusLineY = window.innerHeight * (FOCUS_OFFSET_VH / 100);
        const scrollOffset = focusLineY - rect.top;
        setTypewriterOffset(scrollOffset);
      }
    }

    if (!selection.isCollapsed) {
      setToolbarPos({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX
      });
    } else {
      setToolbarPos(null);
    }
  }, [isTypewriterMode]);

  // Autosave effect
  useEffect(() => {
    if (!id) return;
    const handler = setTimeout(() => {
      if (!isSaved && draftData) {
        const markdown = turndownService.turndown(contentHtml);
        updateDraft(id, { title, content: markdown });
        setIsSaved(true);
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [title, contentHtml, isSaved, id, updateDraft, draftData]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newHtml = e.currentTarget.innerHTML;
    setContentHtml(newHtml);
    setIsSaved(false);
    updateCaretInfo();
  };

  const applyFormat = (type: string) => {
    document.execCommand(type, false);
    // Ensure state is updated after execCommand
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML);
    }
    setIsSaved(false);
    setToolbarPos(null);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    setIsSaved(false);
  };

  const handlePublish = useCallback(async () => {
    if (!id) return;
    const markdown = turndownService.turndown(contentHtml);
    await updateDraft(id, { title, content: markdown, status: 'published' });
    toast.success("Entry published!");
    navigate('/');
  }, [id, updateDraft, navigate, title, contentHtml]);

  const typewriterMask = `linear-gradient(
    to bottom,
    rgba(0,0,0,0.25) 0%,
    rgba(0,0,0,0.25) calc(${FOCUS_OFFSET_VH}vh - 1px),
    rgba(0,0,0,1) calc(${FOCUS_OFFSET_VH}vh),
    rgba(0,0,0,1) calc(${FOCUS_OFFSET_VH}vh + ${LINE_HEIGHT}px),
    rgba(0,0,0,0.25) calc(${FOCUS_OFFSET_VH}vh + ${LINE_HEIGHT}px + 1px),
    rgba(0,0,0,0.25) 100%
  )`;

  if (!id || !draftData) return null;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-500 overflow-hidden">
      {!isTypewriterMode && <TextFormattingToolbar position={toolbarPos} onFormat={applyFormat} />}
      
      <header className={cn(
        "p-4 border-b border-border/50 flex justify-between items-center z-20 bg-background/80 backdrop-blur-sm transition-all duration-700",
        isTypewriterMode ? "opacity-0 -translate-y-full pointer-events-none absolute w-full" : "opacity-100 translate-y-0"
      )}>
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center text-xl font-serif font-bold tracking-tight">
            <ChevronLeft className="mr-1 h-5 w-5" /> Wr1te Pages
          </Link>
          <span className="text-sm text-muted-foreground">{isSaved ? 'Saved' : 'Saving...'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => {
              setIsTypewriterMode(true);
              setTimeout(updateCaretInfo, 50);
            }}
            title="Typewriter Mode"
          >
            <Keyboard className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-1 h-auto text-sm font-medium ml-2">Publish</Button>
          <ExportOptions title={title} content={turndownService.turndown(contentHtml)} />
          <UserMenu isAdmin={isAdmin} />
        </div>
      </header>

      {isTypewriterMode && (
        <Button 
          variant="secondary" 
          size="icon" 
          className="fixed top-6 right-6 z-50 rounded-full shadow-lg opacity-90 hover:opacity-100 transition-all scale-110"
          onClick={() => setIsTypewriterMode(false)}
        >
          <Plus className="h-6 w-6 rotate-45" />
        </Button>
      )}

      <main 
        className={cn(
          "flex-1 flex justify-center relative outline-none transition-all duration-500",
          isTypewriterMode ? "overflow-hidden bg-background" : "p-8 md:p-16 lg:p-24 overflow-y-auto"
        )}
        style={isTypewriterMode ? {
          maskImage: typewriterMask,
          WebkitMaskImage: typewriterMask,
        } : {}}
      >
        <div 
          className={cn(
            "w-full max-w-4xl relative z-0 transition-transform duration-300 ease-out",
            isTypewriterMode ? "pt-[40vh]" : "py-0" 
          )}
          style={isTypewriterMode ? { transform: `translateY(${typewriterOffset}px)` } : {}}
        >
          {!isTypewriterMode && (
            <textarea
              ref={titleRef}
              value={title}
              onChange={handleTitleChange}
              className="w-full resize-none text-5xl font-serif font-extrabold leading-tight mb-8 focus:outline-none bg-transparent placeholder:text-muted/30 overflow-hidden"
              placeholder="Title"
              rows={1}
            />
          )}
          
          <div className="relative">
            {!isTypewriterMode && plusButtonTop !== null && (
              <div 
                className="absolute -left-12 md:-left-16 flex items-center justify-center transition-all duration-200 ease-out opacity-20 hover:opacity-100 z-10"
                style={{ top: `${plusButtonTop}px`, height: `${LINE_HEIGHT}px`, width: '40px' }}
              >
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground h-8 w-8">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div 
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onSelect={updateCaretInfo}
              onKeyUp={updateCaretInfo}
              onMouseUp={updateCaretInfo}
              className={cn(
                "w-full min-h-[60vh] focus:outline-none bg-transparent prose prose-lg dark:prose-invert max-w-none relative z-0",
                isTypewriterMode 
                  ? "font-mono caret-[#00BFFF] leading-[32px] cursor-text" 
                  : "font-serif caret-primary leading-[32px] cursor-text"
              )}
              style={{ lineHeight: `${LINE_HEIGHT}px` }}
              spellCheck="false"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Editor;