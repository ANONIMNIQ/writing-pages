import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDrafts } from '@/hooks/use-drafts';
import { Button } from '@/components/ui/button';
import { Keyboard, ChevronLeft, Plus, Menu } from 'lucide-react';
import ExportOptions from '@/components/ExportOptions';
import TextFormattingToolbar from '@/components/TextFormattingToolbar';
import EditorSidebar from '@/components/EditorSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { supabase } from '@/integrations/supabase/client';

const turndownService = new TurndownService();
turndownService.addRule('emptyParagraph', {
  filter: 'p',
  replacement: function (content) {
    return content ? '\n\n' + content + '\n\n' : '\n\n';
  }
});

const LINE_HEIGHT = 32;
const FOCUS_OFFSET_VH = 40; 

interface Chapter {
  id: string;
  text: string;
  level: number;
}

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDraft, updateDraft } = useDrafts();
  
  const [draftData, setDraftData] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [plusButtonTop, setPlusButtonTop] = useState<number | null>(null);
  const [isTypewriterMode, setIsTypewriterMode] = useState(false);
  const [typewriterOffset, setTypewriterOffset] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const editorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
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

  const updateChapters = useCallback(() => {
    if (!editorRef.current) return;
    const headers = editorRef.current.querySelectorAll('h1, h2');
    const newChapters: Chapter[] = Array.from(headers).map((header, index) => {
      const id = `chapter-${index}`;
      header.id = id;
      return {
        id,
        text: (header as HTMLElement).innerText || 'Untitled Section',
        level: header.tagName === 'H1' ? 1 : 2
      };
    });
    setChapters(newChapters);
  }, []);

  // Fetch draft data
  useEffect(() => {
    const fetchDraft = async () => {
      if (id) {
        const draft = await getDraft(id);
        if (draft) {
          setDraftData(draft);
          setTitle(draft.title || '');
        } else {
          navigate('/');
          toast.error("Draft not found.");
        }
      }
    };
    fetchDraft();
  }, [id, getDraft, navigate]);

  // Initialize editor content once ref is available
  useEffect(() => {
    if (draftData && editorRef.current && !isContentInitialized.current) {
      const htmlContent = marked.parse(draftData.content || '') as string;
      editorRef.current.innerHTML = htmlContent;
      isContentInitialized.current = true;
      updateChapters();
    }
  }, [draftData, updateChapters]);

  const updateCaretInfo = useCallback(() => {
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !editorRef.current || !wrapperRef.current) return;

      const range = selection.getRangeAt(0);
      let rect = range.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();

      if (rect.height === 0 || rect.top === 0) {
        const container = range.startContainer;
        const element = container.nodeType === 1 ? (container as HTMLElement) : container.parentElement;
        if (element && element !== editorRef.current) {
          rect = element.getBoundingClientRect();
        } else if (editorRef.current.lastElementChild) {
          rect = editorRef.current.lastElementChild.getBoundingClientRect();
        }
      }

      if (rect.top === 0 && rect.height === 0) return;

      const relativeTop = rect.top - editorRect.top;
      const caretHeight = rect.height || LINE_HEIGHT;
      
      setPlusButtonTop(relativeTop + (caretHeight / 2) - (LINE_HEIGHT / 2));

      if (isTypewriterMode) {
        const focusPointY = window.innerHeight * (FOCUS_OFFSET_VH / 100);
        const caretYRelativeToEditor = rect.top - editorRect.top;
        setTypewriterOffset(focusPointY - caretYRelativeToEditor);
      }

      if (!selection.isCollapsed) {
        setToolbarPos({
          top: rect.top + window.scrollY,
          left: rect.left + rect.width / 2 + window.scrollX
        });
      } else {
        setToolbarPos(null);
      }
    });
  }, [isTypewriterMode]);

  const moveCursorToEnd = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  const handleEnterTypewriter = () => {
    setIsTypewriterMode(true);
    setTimeout(() => {
      moveCursorToEnd();
      setTimeout(() => {
        updateCaretInfo();
        setTimeout(updateCaretInfo, 100);
      }, 50);
    }, 50);
  };

  const saveContent = useCallback(async () => {
    if (!id || !isContentInitialized.current) return;
    const currentHtml = editorRef.current?.innerHTML || '';
    const markdown = turndownService.turndown(currentHtml);
    try {
      await updateDraft(id, { title: title || 'Untitled', content: markdown });
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to auto-save:", error);
    }
  }, [id, title, updateDraft]);

  useEffect(() => {
    if (isSaved) return;
    const handler = setTimeout(() => {
      saveContent();
    }, 1000);
    return () => clearTimeout(handler);
  }, [isSaved, saveContent]);

  const handleInput = () => {
    setIsSaved(false);
    updateCaretInfo();
    updateChapters();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setTimeout(updateCaretInfo, 0);
      setTimeout(updateChapters, 100);
    }
  };

  const applyFormat = (type: string) => {
    if (type.startsWith('formatBlock:')) {
      const tag = type.split(':')[1];
      document.execCommand('formatBlock', false, tag);
    } else {
      document.execCommand(type, false);
    }
    setIsSaved(false);
    setToolbarPos(null);
    editorRef.current?.focus();
    updateChapters();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    setIsSaved(false);
  };

  const handlePublish = useCallback(async () => {
    if (!id || !editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    const markdown = turndownService.turndown(currentHtml);
    await updateDraft(id, { title: title || 'Untitled', content: markdown, status: 'published' });
    toast.success("Entry published!");
    navigate('/');
  }, [id, updateDraft, navigate, title]);

  const handleChapterClick = (chapterId: string) => {
    const element = document.getElementById(chapterId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // In typewriter mode, we need to update the offset after scrolling
      if (isTypewriterMode) {
        setTimeout(updateCaretInfo, 500);
      }
    }
  };

  const typewriterMask = `linear-gradient(
    to bottom,
    rgba(255,255,255,0.25) 0%,
    rgba(255,255,255,0.25) calc(${FOCUS_OFFSET_VH}vh - 5px),
    rgba(255,255,255,1) calc(${FOCUS_OFFSET_VH}vh - 2px),
    rgba(255,255,255,1) calc(${FOCUS_OFFSET_VH}vh + ${LINE_HEIGHT}px + 2px),
    rgba(255,255,255,0.25) calc(${FOCUS_OFFSET_VH}vh + ${LINE_HEIGHT}px + 5px),
    rgba(255,255,255,0.25) 100%
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hidden lg:flex" 
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center text-xl font-serif font-bold tracking-tight">
            <ChevronLeft className="mr-1 h-5 w-5" /> Wr1te Pages
          </Link>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            {isSaved ? 'Saved' : 'Saving...'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleEnterTypewriter} title="Typewriter Mode">
            <Keyboard className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-1 h-auto text-sm font-medium ml-2">Publish</Button>
          <ExportOptions title={title} content={editorRef.current ? turndownService.turndown(editorRef.current.innerHTML) : ''} />
          <UserMenu isAdmin={isAdmin} />
        </div>
      </header>

      {isTypewriterMode && (
        <Button variant="secondary" size="icon" className="fixed top-6 right-6 z-50 rounded-full shadow-lg opacity-90 hover:opacity-100 transition-all scale-110" onClick={() => { setIsTypewriterMode(false); setTypewriterOffset(0); }}>
          <Plus className="h-6 w-6 rotate-45" />
        </Button>
      )}

      <div className="flex-1 flex overflow-hidden">
        {!isTypewriterMode && (
          <EditorSidebar 
            chapters={chapters} 
            onChapterClick={handleChapterClick} 
            isVisible={isSidebarVisible} 
          />
        )}

        <main 
          className={cn(
            "flex-1 flex justify-center relative outline-none transition-all duration-500",
            isTypewriterMode ? "overflow-hidden bg-background" : "p-8 md:p-16 lg:p-24 overflow-y-auto"
          )}
          style={isTypewriterMode ? { maskImage: typewriterMask, WebkitMaskImage: typewriterMask } : {}}
        >
          <div 
            ref={wrapperRef}
            className="w-full max-w-4xl relative z-0 transition-transform duration-300 ease-out will-change-transform"
            style={isTypewriterMode ? { transform: `translateY(${typewriterOffset}px)` } : {}}
          >
            {!isTypewriterMode && (
              <textarea
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
                onKeyDown={handleKeyDown}
                onSelect={updateCaretInfo}
                onKeyUp={updateCaretInfo}
                onMouseUp={updateCaretInfo}
                className={cn(
                  "editor-content w-full min-h-[60vh] focus:outline-none bg-transparent prose prose-xl prose-stone dark:prose-invert max-w-none relative z-0 pb-[50vh]",
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
    </div>
  );
};

export default Editor;