import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDrafts, Note } from '@/hooks/use-drafts';
import { Button } from '@/components/ui/button';
import { Keyboard, ChevronLeft, Plus, Menu, RotateCcw } from 'lucide-react';
import ExportOptions from '@/components/ExportOptions';
import TextFormattingToolbar from '@/components/TextFormattingToolbar';
import EditorSidebar from '@/components/EditorSidebar';
import NotesSidebar from '@/components/NotesSidebar';
import EditorStats from '@/components/EditorStats';
import NoteConnection from '@/components/NoteConnection';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

const turndownService = new TurndownService();
turndownService.addRule('emptyParagraph', {
  filter: 'p',
  replacement: function (content) {
    return content ? '\n\n' + content + '\n\n' : '\n\n';
  }
});

turndownService.addRule('noteHighlight', {
  filter: (node) => node.nodeName === 'SPAN' && node.classList.contains('note-highlight'),
  replacement: (content, node) => {
    const id = (node as HTMLElement).getAttribute('data-note-id');
    return `<span class="note-highlight" data-note-id="${id}">${content}</span>`;
  }
});

const LINE_HEIGHT = 32;
const FOCUS_OFFSET_VH = 40; 
const MAX_TITLE_LENGTH = 30;

interface Chapter {
  id: string;
  text: string;
  level: number;
}

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { getDraft, updateDraft } = useDrafts();
  
  const [draftData, setDraftData] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [plusButtonTop, setPlusButtonTop] = useState<number | null>(null);
  const [isTypewriterMode, setIsTypewriterMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [stats, setStats] = useState({ characters: 0, readingTime: 0 });

  const editorRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
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

  const updateStats = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const characters = text.length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 200) || 1; 
    setStats({ characters, readingTime });
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

  useEffect(() => {
    const fetchDraft = async () => {
      if (id) {
        const draft = await getDraft(id);
        if (draft) {
          setDraftData(draft);
          setTitle(draft.title || '');
          setNotes(draft.notes || []);
        } else {
          navigate('/');
          toast.error("Draft not found.");
        }
      }
    };
    fetchDraft();
  }, [id, getDraft, navigate]);

  useEffect(() => {
    if (draftData && editorRef.current && !isContentInitialized.current) {
      const htmlContent = marked.parse(draftData.content || '') as string;
      editorRef.current.innerHTML = htmlContent;
      isContentInitialized.current = true;
      updateChapters();
      updateStats();
    }
  }, [draftData, updateChapters, updateStats]);

  const updateCaretInfo = useCallback((options: { immediateScroll?: boolean; allowTypewriterScroll?: boolean } = {}) => {
    const { immediateScroll = false, allowTypewriterScroll = false } = options;
    
    // Don't update caret info if the text is published/read-only
    if (draftData?.status === 'published') return;

    requestAnimationFrame(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !editorRef.current || !wrapperRef.current) return;

      const range = selection.getRangeAt(0);
      let rect = range.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();
      const mainElement = mainRef.current;

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

      if (isTypewriterMode && mainElement && allowTypewriterScroll) {
        const focusPointY = window.innerHeight * (FOCUS_OFFSET_VH / 100);
        const caretYInViewport = rect.top;
        const diff = caretYInViewport - focusPointY;
        
        if (immediateScroll) {
          mainElement.scrollTop += diff;
        } else if (Math.abs(diff) > 2) {
          mainElement.scrollTop += diff;
        }
      }

      if (!selection.isCollapsed && !isMobile) {
        setToolbarPos({
          top: rect.top + window.scrollY,
          left: rect.left + rect.width / 2 + window.scrollX
        });
      } else {
        setToolbarPos(null);
      }
    });
  }, [isTypewriterMode, isMobile, draftData?.status]);

  const moveCaretToEnd = useCallback(() => {
    if (!editorRef.current || draftData?.status === 'published') return;
    const el = editorRef.current;
    el.focus();
    
    const range = document.createRange();
    const sel = window.getSelection();
    
    const lastChild = el.lastElementChild || el;
    range.selectNodeContents(lastChild);
    range.collapse(false);
    
    sel?.removeAllRanges();
    sel?.addRange(range);
    
    setTimeout(() => updateCaretInfo({ immediateScroll: true, allowTypewriterScroll: true }), 10);
  }, [updateCaretInfo, draftData?.status]);

  const saveContent = useCallback(async () => {
    if (!id || !isContentInitialized.current || draftData?.status === 'published') return;
    const currentHtml = editorRef.current?.innerHTML || '';
    const markdown = turndownService.turndown(currentHtml);
    try {
      await updateDraft(id, { 
        title: title || 'Untitled', 
        content: markdown,
        notes: notes 
      });
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to auto-save:", error);
    }
  }, [id, title, updateDraft, notes, draftData?.status]);

  useEffect(() => {
    if (isSaved || draftData?.status === 'published') return;
    const handler = setTimeout(() => {
      saveContent();
    }, 1000);
    return () => clearTimeout(handler);
  }, [isSaved, saveContent, draftData?.status]);

  const handleInput = () => {
    if (draftData?.status === 'published') return;
    setIsSaved(false);
    updateCaretInfo({ allowTypewriterScroll: true });
    updateChapters();
    updateStats();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (draftData?.status === 'published') return;
    const value = e.target.value;
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value);
      setIsSaved(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (draftData?.status === 'published') return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    const parentElement = node.nodeType === 3 ? node.parentElement : (node as HTMLElement);
    const highlightSpan = parentElement?.closest('.note-highlight');

    if (highlightSpan && selection.isCollapsed) {
      const isAtEnd = range.startOffset === (node.textContent?.length || 0);
      
      if (isAtEnd && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        
        const afterNode = document.createTextNode(e.key === ' ' ? '\u00A0' : '\u00A0');
        highlightSpan.parentNode?.insertBefore(afterNode, highlightSpan.nextSibling);

        if (e.key === 'Enter') {
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          const block = highlightSpan.closest('p, h1, h2, blockquote') || highlightSpan.parentNode;
          block?.parentNode?.insertBefore(p, block.nextSibling);
          
          const newRange = document.createRange();
          newRange.setStart(p, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          const newRange = document.createRange();
          newRange.setStart(afterNode, 1);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        
        setIsSaved(false);
        updateCaretInfo({ allowTypewriterScroll: true });
        return;
      }
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const highlight = target.closest('.note-highlight');
      if (highlight) {
        const noteId = highlight.getAttribute('data-note-id');
        if (noteId) {
          setActiveNoteId(noteId);
          highlight.classList.add('ring-highlight');
          setTimeout(() => highlight.classList.remove('ring-highlight'), 1500);
        }
      } else {
        setActiveNoteId(null);
      }
    };

    editor.addEventListener('click', handleClick);
    return () => editor.removeEventListener('click', handleClick);
  }, [draftData]);

  const applyFormat = (type: string) => {
    if (draftData?.status === 'published') return;
    
    if (type === 'addNote') {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        const highlightedText = selection.toString();
        const noteId = uuidv4();
        
        const span = document.createElement('span');
        span.className = "note-highlight";
        span.setAttribute('data-note-id', noteId);
        
        const range = selection.getRangeAt(0);
        range.surroundContents(span);
        
        const newNote: Note = {
          id: noteId,
          text: "",
          highlightedText: highlightedText.substring(0, 50) + (highlightedText.length > 50 ? "..." : ""),
          createdAt: Date.now()
        };
        
        setNotes(prev => [newNote, ...prev]);
        setActiveNoteId(noteId);
        setIsSaved(false);
        setToolbarPos(null);
      }
      return;
    }

    if (type.startsWith('formatBlock:')) {
      const tag = type.split(':')[1].toUpperCase();
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.startContainer;
        if (node.nodeType === 3) node = node.parentElement!;
        
        const highLevelBlock = (node as HTMLElement).closest('h1, h2, blockquote');
        const currentTag = highLevelBlock?.tagName;

        if (currentTag === tag) {
          if (tag === 'BLOCKQUOTE') {
            document.execCommand('outdent', false);
          } else {
            document.execCommand('formatBlock', false, 'p');
          }
        } else {
          document.execCommand('formatBlock', false, tag);
        }
      }
    } else {
      document.execCommand(type, false);
    }
    setIsSaved(false);
    setToolbarPos(null);
    editorRef.current?.focus();
    updateChapters();
    updateStats();
  };

  const handleUpdateNote = (noteId: string, text: string) => {
    if (draftData?.status === 'published') return;
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, text } : n));
    setIsSaved(false);
  };

  const handleDeleteNote = (noteId: string) => {
    if (draftData?.status === 'published') return;
    
    if (editorRef.current) {
      const highlight = editorRef.current.querySelector(`.note-highlight[data-note-id="${noteId}"]`);
      if (highlight) {
        const parent = highlight.parentNode;
        while (highlight.firstChild) {
          parent?.insertBefore(highlight.firstChild, highlight);
        }
        highlight.remove();
      }
    }
    
    setNotes(prev => prev.filter(n => n.id !== noteId));
    if (activeNoteId === noteId) setActiveNoteId(null);
    setIsSaved(false);
  };

  const handleFocusNote = (noteId: string) => {
    setActiveNoteId(noteId);
    if (editorRef.current) {
      const highlight = editorRef.current.querySelector(`.note-highlight[data-note-id="${noteId}"]`);
      if (highlight) {
        highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlight.classList.add('ring-highlight');
        setTimeout(() => highlight.classList.remove('ring-highlight'), 1500);
      }
    }
  };

  const handleChapterClick = (chapterId: string) => {
    const element = document.getElementById(chapterId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const headerBgColor = draftData.status === 'published' 
    ? "bg-[#fdf6e3] dark:bg-[#2a271f]" 
    : "bg-zinc-100 dark:bg-zinc-900";

  return (
    <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-500 overflow-hidden">
      {!isTypewriterMode && !isMobile && draftData.status === 'draft' && <TextFormattingToolbar position={toolbarPos} onFormat={applyFormat} />}
      
      <header className={cn(
        "p-4 border-b border-border/50 flex justify-between items-center z-20 backdrop-blur-sm transition-all duration-700",
        headerBgColor,
        isTypewriterMode ? "opacity-0 -translate-y-full pointer-events-none absolute w-full" : "opacity-100 translate-y-0"
      )}>
        <div className="flex items-center space-x-4">
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hidden lg:flex" 
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center text-xl font-serif font-bold tracking-tight">
            <ChevronLeft className="mr-1 h-5 w-5" /> 
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline">Wr1te Pages</span>
              <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary/60 border-none">
                Beta
              </Badge>
            </div>
          </Link>
          {draftData.status === 'draft' && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest hidden sm:inline">
              {isSaved ? 'Saved' : 'Saving...'}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!isMobile && draftData.status === 'draft' && (
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
              setIsTypewriterMode(true);
              setTimeout(() => {
                moveCaretToEnd();
              }, 100);
            }} title="Typewriter Mode">
              <Keyboard className="h-5 w-5" />
            </Button>
          )}
          <ThemeToggle />
          {draftData.status === 'draft' ? (
            <Button onClick={async () => {
              if (!id || !editorRef.current) return;
              const markdown = turndownService.turndown(editorRef.current.innerHTML);
              await updateDraft(id, { title, content: markdown, status: 'published', notes });
              const updated = await getDraft(id);
              if (updated) setDraftData(updated);
              toast.success("Entry published!");
              navigate('/');
            }} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-1 h-auto text-sm font-medium ml-2">Publish</Button>
          ) : (
            <Button 
              onClick={async () => {
                await updateDraft(id, { status: 'draft' });
                const updated = await getDraft(id);
                if (updated) setDraftData(updated);
                toast.success("Entry reverted to draft.");
              }} 
              variant="outline" 
              className="rounded-full px-4 py-1 h-auto text-sm font-medium ml-2 border-primary/20 hover:bg-primary/5 gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden xs:inline">Revert</span>
            </Button>
          )}
          {draftData.status === 'published' && (
            <ExportOptions title={title} content={editorRef.current ? turndownService.turndown(editorRef.current.innerHTML) : ''} />
          )}
          <UserMenu isAdmin={isAdmin} />
        </div>
      </header>

      {isTypewriterMode && (
        <Button variant="secondary" size="icon" className="fixed top-6 right-6 z-50 rounded-full shadow-lg opacity-90 hover:opacity-100 transition-all scale-110" onClick={() => { setIsTypewriterMode(false); }}>
          <Plus className="h-6 w-6 rotate-45" />
        </Button>
      )}

      <div className="flex-1 flex overflow-hidden">
        {!isTypewriterMode && !isMobile && (
          <EditorSidebar 
            chapters={chapters} 
            onChapterClick={handleChapterClick} 
            isVisible={isSidebarVisible} 
          />
        )}

        <main 
          ref={mainRef}
          onScroll={() => updateCaretInfo({ allowTypewriterScroll: false })}
          className={cn(
            "flex-1 flex justify-center relative outline-none transition-all duration-500 overflow-y-auto scroll-smooth",
            isTypewriterMode ? "bg-background hide-scrollbar pb-0" : "p-6 md:p-16 lg:p-24"
          )}
          style={isTypewriterMode ? { maskImage: typewriterMask, WebkitMaskImage: typewriterMask } : {}}
        >
          <div 
            ref={wrapperRef}
            className="w-full max-w-4xl relative z-0 transition-all duration-300"
          >
            {!isTypewriterMode && (
              <div className="mb-8">
                <textarea
                  value={title}
                  onChange={handleTitleChange}
                  readOnly={draftData.status === 'published'}
                  className={cn(
                    "w-full resize-none text-3xl md:text-5xl font-serif font-extrabold leading-tight focus:outline-none bg-transparent placeholder:text-muted/30 overflow-hidden",
                    draftData.status === 'published' && "cursor-default"
                  )}
                  placeholder="Title"
                  rows={1}
                />
                {draftData.status === 'draft' && (
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground/40 font-mono">
                      {title.length}/{MAX_TITLE_LENGTH}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className="relative">
              {!isTypewriterMode && !isMobile && plusButtonTop !== null && draftData.status === 'draft' && (
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
                contentEditable={draftData.status === 'draft'}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onSelect={() => updateCaretInfo({ allowTypewriterScroll: true })}
                onKeyUp={() => updateCaretInfo({ allowTypewriterScroll: true })}
                onMouseUp={() => updateCaretInfo({ allowTypewriterScroll: true })}
                className={cn(
                  "editor-content w-full min-h-[60vh] focus:outline-none bg-transparent max-w-none relative z-0 pb-[70vh]",
                  isTypewriterMode 
                    ? "font-mono typewriter-active caret-[#00BFFF] leading-[32px] cursor-text pt-[40vh]" 
                    : "font-serif caret-primary leading-[32px] cursor-text prose prose-xl prose-stone dark:prose-invert",
                  draftData.status === 'published' && "cursor-default"
                )}
                style={{ lineHeight: `${LINE_HEIGHT}px` }}
                spellCheck="false"
              />
            </div>
          </div>
        </main>

        {!isTypewriterMode && !isMobile && (
          <NotesSidebar 
            notes={notes}
            activeNoteId={activeNoteId}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onFocusNote={handleFocusNote}
            isVisible={isSidebarVisible}
          />
        )}
      </div>

      <EditorStats 
        characters={stats.characters} 
        readingTime={stats.readingTime} 
        isTypewriterMode={isTypewriterMode} 
      />

      <NoteConnection activeNoteId={activeNoteId} editorRef={editorRef} />
    </div>
  );
};

export default Editor;