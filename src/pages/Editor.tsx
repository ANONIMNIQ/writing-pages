import React, { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDrafts } from '@/hooks/use-drafts';
import { Button } from '@/components/ui/button';
import { Bell, User, Plus, Type, ChevronLeft } from 'lucide-react';
import ExportOptions from '@/components/ExportOptions';
import TextFormattingToolbar from '@/components/TextFormattingToolbar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { useAutosizeTextArea } from '@/hooks/use-autosize-textarea';
import getCaretCoordinates from 'textarea-caret';
import { cn } from '@/lib/utils';

const LINE_HEIGHT = 32;
const FOCUS_TOP_PERCENT = 40; 

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDraft, updateDraft } = useDrafts();
  
  const initialDraft = id ? getDraft(id) : undefined;

  const [title, setTitle] = useState(initialDraft?.title || 'Title');
  const [content, setContent] = useState(initialDraft?.content || '');
  const [isSaved, setIsSaved] = useState(true);
  const [caretLineIndex, setCaretLineIndex] = useState(0);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [isTypewriterMode, setIsTypewriterMode] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const titleRef = useAutosizeTextArea(title);
  const contentRef = useAutosizeTextArea(content);

  useEffect(() => {
    if (!id || !initialDraft) {
      navigate('/');
      toast.error("Draft not found.");
    }
  }, [id, initialDraft, navigate]);

  // Precise Centering: Keeps the cursor line at exactly 40% of the viewport height
  const centerCaret = useCallback(() => {
    if (!isTypewriterMode || !mainRef.current || !contentRef.current) return;
    
    const container = mainRef.current;
    const textarea = contentRef.current;
    const viewportHeight = container.clientHeight;
    
    // Get caret coordinates relative to the top of the textarea
    const caret = getCaretCoordinates(textarea, textarea.selectionStart);
    
    // We want the caret line to be at FOCUS_TOP_PERCENT of the viewport.
    // The textarea has a top padding of 50vh (0.5 * viewportHeight).
    // The scroll position should be: (PaddingTop + CaretTop) - ViewportFocusPoint
    // scrollTop = (0.5 * vh + caret.top) - (0.4 * vh) = 0.1 * vh + caret.top
    const targetScroll = (viewportHeight * 0.1) + caret.top;
    
    container.scrollTop = targetScroll;
  }, [isTypewriterMode]);

  // Use useLayoutEffect to update scroll position BEFORE the browser repaints
  useLayoutEffect(() => {
    if (isTypewriterMode) {
      centerCaret();
    }
  }, [centerCaret, content, caretLineIndex, isTypewriterMode]);

  // Auto-save
  useEffect(() => {
    if (!id) return;
    const handler = setTimeout(() => {
      if (!isSaved) {
        updateDraft(id, { title, content });
        setIsSaved(true);
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [title, content, isSaved, id, updateDraft]);

  const updateCaretLine = useCallback((textarea: HTMLTextAreaElement) => {
    const textBeforeCaret = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBeforeCaret.split('\n');
    setCaretLineIndex(lines.length - 1);
  }, []);

  const handleSelection = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const middle = start + Math.floor((end - start) / 2);
      const coordinates = getCaretCoordinates(textarea, middle);
      const rect = textarea.getBoundingClientRect();
      
      setToolbarPos({
        top: rect.top + coordinates.top + window.scrollY,
        left: rect.left + coordinates.left + window.scrollX
      });
    } else {
      setToolbarPos(null);
    }
    updateCaretLine(textarea);
  };

  const applyFormat = (type: string) => {
    if (!contentRef.current) return;
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = content;
    let cursorOffset = 0;

    switch (type) {
      case 'bold': newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end); cursorOffset = 2; break;
      case 'italic': newText = content.substring(0, start) + `_${selectedText}_` + content.substring(end); cursorOffset = 1; break;
      case 'h1': newText = content.substring(0, start) + `# ${selectedText}` + content.substring(end); break;
      case 'h2': newText = content.substring(0, start) + `## ${selectedText}` + content.substring(end); break;
      case 'quote': newText = content.substring(0, start) + `> ${selectedText}` + content.substring(end); break;
      default: return;
    }

    setContent(newText);
    setIsSaved(false);
    setToolbarPos(null);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, end + cursorOffset);
    }, 0);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    setIsSaved(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
    updateCaretLine(e.target);
  };

  const handlePublish = useCallback(() => {
    if (!id) return;
    updateDraft(id, { status: 'published' });
    toast.success("Entry published!");
    navigate('/');
  }, [id, updateDraft, navigate]);

  // Sharp Focus Mask: Exactly one line is visible, everything else is dimmed
  const typewriterMask = `linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.15) ${FOCUS_TOP_PERCENT}%,
    rgba(0, 0, 0, 1) ${FOCUS_TOP_PERCENT}%,
    rgba(0, 0, 0, 1) calc(${FOCUS_TOP_PERCENT}% + ${LINE_HEIGHT}px),
    rgba(0, 0, 0, 0.15) calc(${FOCUS_TOP_PERCENT}% + ${LINE_HEIGHT}px),
    rgba(0, 0, 0, 0.15) 100%
  )`;

  if (!id || !initialDraft) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-hidden">
      <TextFormattingToolbar position={toolbarPos} onFormat={applyFormat} />
      
      <header className={cn(
        "p-4 border-b border-border/50 flex justify-between items-center z-20 bg-background/80 backdrop-blur-sm transition-opacity duration-500",
        isTypewriterMode ? "opacity-0 pointer-events-none absolute" : "opacity-100"
      )}>
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center text-xl font-serif font-bold tracking-tight">
            <ChevronLeft className="mr-1 h-5 w-5" /> Dyad Writer
          </Link>
          <span className="text-sm text-muted-foreground">{isSaved ? 'Saved' : 'Saving...'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setIsTypewriterMode(true)}
            title="Typewriter Mode"
          >
            <Type className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-1 h-auto text-sm font-medium ml-2">Publish</Button>
          <ExportOptions title={title} content={content} />
          <Button variant="ghost" size="icon" className="rounded-full"><Bell className="h-5 w-5 text-muted-foreground" /></Button>
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center overflow-hidden"><User className="h-4 w-4 text-muted-foreground" /></div>
        </div>
      </header>

      {isTypewriterMode && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 right-4 z-50 rounded-full opacity-30 hover:opacity-100"
          onClick={() => setIsTypewriterMode(false)}
        >
          <Plus className="h-6 w-6 rotate-45" />
        </Button>
      )}

      <main 
        ref={mainRef}
        className={cn(
          "flex-1 flex justify-center overflow-y-auto relative transition-all duration-300",
          isTypewriterMode ? "hide-scrollbar cursor-none" : "p-8 md:p-16 lg:p-24"
        )}
        style={isTypewriterMode ? {
          maskImage: typewriterMask,
          WebkitMaskImage: typewriterMask,
        } : {}}
        onScroll={() => !isTypewriterMode && setToolbarPos(null)}
      >
        <div className={cn(
          "w-full max-w-3xl relative z-0",
          isTypewriterMode && "py-[50vh]" 
        )}>
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
            {!isTypewriterMode && (
              <div 
                className="absolute -left-12 flex items-center justify-center transition-all duration-200 ease-out opacity-50 hover:opacity-100"
                style={{ top: `${caretLineIndex * LINE_HEIGHT}px`, height: `${LINE_HEIGHT}px`, width: '40px' }}
              >
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground h-8 w-8">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            <textarea
              ref={contentRef}
              value={content}
              onChange={handleContentChange}
              onSelect={handleSelection}
              onKeyUp={(e) => { updateCaretLine(e.currentTarget); if (e.key === 'Escape') setToolbarPos(null); }}
              onMouseUp={(e) => updateCaretLine(e.currentTarget)}
              className={cn(
                "w-full resize-none text-xl font-serif focus:outline-none bg-transparent placeholder:text-muted/30 overflow-hidden outline-none transition-all duration-300",
                isTypewriterMode ? "caret-[#00BFFF]" : "caret-primary"
              )}
              placeholder="Tell your story..."
              style={{ lineHeight: `${LINE_HEIGHT}px`, minHeight: '60vh', padding: 0 }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Editor;