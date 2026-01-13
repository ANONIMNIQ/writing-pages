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
const FOCUS_OFFSET_VH = 40; 

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
  const [typewriterOffset, setTypewriterOffset] = useState(0);

  const mainRef = useRef<HTMLElement>(null);
  const titleRef = useAutosizeTextArea(title);
  const contentRef = useAutosizeTextArea(content);

  useEffect(() => {
    if (!id || !initialDraft) {
      navigate('/');
      toast.error("Draft not found.");
    }
  }, [id, initialDraft, navigate]);

  // Mechanical Typewriter Engine: 
  // We move the "paper" (the content div) up or down so the caret is always at the fixed focus line.
  const centerCaret = useCallback(() => {
    if (!isTypewriterMode || !contentRef.current) return;
    
    requestAnimationFrame(() => {
      const textarea = contentRef.current;
      if (!textarea) return;

      const caret = getCaretCoordinates(textarea, textarea.selectionStart);
      // Move the entire content block so the caret line sits exactly at the FOCUS_OFFSET_VH line.
      setTypewriterOffset(-caret.top);
    });
  }, [isTypewriterMode]);

  useLayoutEffect(() => {
    if (isTypewriterMode) {
      centerCaret();
    }
  }, [content, isTypewriterMode, centerCaret]);

  // Auto-save logic
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
    if (isTypewriterMode) centerCaret();
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
    if (isTypewriterMode) centerCaret();
  };

  const handlePublish = useCallback(() => {
    if (!id) return;
    updateDraft(id, { status: 'published' });
    toast.success("Entry published!");
    navigate('/');
  }, [id, updateDraft, navigate]);

  // Sharp Focus Mask: Ensures all non-focused lines are consistently 25% opacity.
  const typewriterMask = `linear-gradient(
    to bottom,
    rgba(0,0,0,0.25) 0%,
    rgba(0,0,0,0.25) calc(${FOCUS_OFFSET_VH}vh - 1px),
    rgba(0,0,0,1) calc(${FOCUS_OFFSET_VH}vh),
    rgba(0,0,0,1) calc(${FOCUS_OFFSET_VH}vh + ${LINE_HEIGHT}px),
    rgba(0,0,0,0.25) calc(${FOCUS_OFFSET_VH}vh + ${LINE_HEIGHT}px + 1px),
    rgba(0,0,0,0.25) 100%
  )`;

  if (!id || !initialDraft) return null;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-500 overflow-hidden">
      {/* Hide formatting toolbar in typewriter mode */}
      {!isTypewriterMode && <TextFormattingToolbar position={toolbarPos} onFormat={applyFormat} />}
      
      <header className={cn(
        "p-4 border-b border-border/50 flex justify-between items-center z-20 bg-background/80 backdrop-blur-sm transition-all duration-700",
        isTypewriterMode ? "opacity-0 -translate-y-full pointer-events-none absolute w-full" : "opacity-100 translate-y-0"
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
            onClick={() => {
              setIsTypewriterMode(true);
              setTimeout(centerCaret, 10);
            }}
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
          variant="secondary" 
          size="icon" 
          className="fixed top-4 right-4 z-50 rounded-full opacity-80 hover:opacity-100 transition-opacity duration-300"
          onClick={() => setIsTypewriterMode(false)}
        >
          <Plus className="h-6 w-6 rotate-45" />
        </Button>
      )}

      <main 
        ref={mainRef}
        className={cn(
          "flex-1 flex justify-center relative outline-none",
          isTypewriterMode ? "overflow-hidden cursor-none bg-background" : "p-8 md:p-16 lg:p-24 overflow-y-auto"
        )}
        style={isTypewriterMode ? {
          maskImage: typewriterMask,
          WebkitMaskImage: typewriterMask,
        } : {}}
      >
        <div 
          className={cn(
            "w-full max-w-3xl relative z-0 transition-transform duration-200 ease-out",
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
              onKeyUp={(e) => { 
                updateCaretLine(e.currentTarget); 
                if (e.key === 'Escape') setToolbarPos(null); 
                if (isTypewriterMode) centerCaret();
              }}
              onMouseUp={(e) => {
                updateCaretLine(e.currentTarget);
                if (isTypewriterMode) centerCaret();
              }}
              className={cn(
                "w-full resize-none text-xl focus:outline-none bg-transparent placeholder:text-muted/30 overflow-hidden outline-none m-0 p-0 block",
                isTypewriterMode 
                  ? "font-mono caret-[#00BFFF] leading-[32px]" 
                  : "font-serif caret-primary leading-[32px]"
              )}
              placeholder="Tell your story..."
              style={{ lineHeight: `${LINE_HEIGHT}px`, minHeight: isTypewriterMode ? 'auto' : '60vh' }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Editor;