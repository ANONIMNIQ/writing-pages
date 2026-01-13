import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDrafts } from '@/hooks/use-drafts';
import { Button } from '@/components/ui/button';
import { Bell, User, Plus, Type, Layout } from 'lucide-react';
import ExportOptions from '@/components/ExportOptions';
import TextFormattingToolbar from '@/components/TextFormattingToolbar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { useAutosizeTextArea } from '@/hooks/use-autosize-textarea';
import getCaretCoordinates from 'textarea-caret';
import { cn } from '@/lib/utils';

const LINE_HEIGHT = 32; // Increased line height for better typewriter feel

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDraft, updateDraft } = useDrafts();
  
  const initialDraft = id ? getDraft(id) : undefined;

  const [title, setTitle] = useState(initialDraft?.title || 'Title');
  const [content, setContent] = useState(initialDraft?.content || 'Tell your story...');
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

  // Typewriter Mode: Scroll to center current line
  useEffect(() => {
    if (isTypewriterMode && mainRef.current && contentRef.current) {
      const container = mainRef.current;
      const textarea = contentRef.current;
      const rect = textarea.getBoundingClientRect();
      const viewportHeight = container.clientHeight;
      
      // Calculate the target scroll position
      // We want the current line (caretLineIndex * LINE_HEIGHT) to be at (viewportHeight / 2)
      const lineOffset = caretLineIndex * LINE_HEIGHT;
      const titleHeight = titleRef.current?.scrollHeight || 0;
      const titleMargin = 32; // mb-8
      
      const targetScroll = (titleHeight + titleMargin + lineOffset) - (viewportHeight / 2) + (LINE_HEIGHT / 2);
      
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [caretLineIndex, isTypewriterMode, title]);

  // Auto-save functionality
  useEffect(() => {
    if (!id) return;
    const handler = setTimeout(() => {
      if (!isSaved) {
        updateDraft(id, { title, content });
        setIsSaved(true);
        toast.success("Draft saved.", { duration: 1000 });
      }
    }, 1500);
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

  if (!id || !initialDraft) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <TextFormattingToolbar position={toolbarPos} onFormat={applyFormat} />
      
      <header className="p-4 border-b border-border/50 flex justify-between items-center z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-serif font-bold tracking-tight">Dyad Writer</Link>
          <span className="text-sm text-muted-foreground">{isSaved ? 'Saved' : 'Saving...'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("rounded-full", isTypewriterMode && "bg-accent text-accent-foreground")}
            onClick={() => setIsTypewriterMode(!isTypewriterMode)}
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

      <main 
        ref={mainRef}
        className={cn(
          "flex-1 flex justify-center p-8 md:p-16 lg:p-24 overflow-y-auto scroll-smooth relative",
          isTypewriterMode && "cursor-text"
        )}
        onScroll={() => setToolbarPos(null)}
      >
        {/* Typewriter Mode Faded Overlays */}
        {isTypewriterMode && (
          <>
            <div className="fixed inset-x-0 top-16 h-1/3 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none z-10" />
            <div className="fixed inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10" />
          </>
        )}

        <div className="w-full max-w-3xl relative z-0">
          <textarea
            ref={titleRef}
            value={title}
            onChange={handleTitleChange}
            className={cn(
              "w-full resize-none text-5xl font-serif font-extrabold leading-tight mb-8 focus:outline-none bg-transparent placeholder:text-muted/30 overflow-hidden transition-opacity duration-500",
              isTypewriterMode && caretLineIndex > 0 ? "opacity-20" : "opacity-100"
            )}
            placeholder="Title"
            rows={1}
          />
          
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
                "w-full resize-none text-xl font-serif focus:outline-none bg-transparent placeholder:text-muted/30 overflow-hidden",
                isTypewriterMode && "caret-blue-500"
              )}
              placeholder="Tell your story..."
              style={{ lineHeight: `${LINE_HEIGHT}px`, minHeight: '600px', padding: 0 }}
            />
          </div>
          
          {/* Add extra padding at the bottom so we can always center the last line */}
          {isTypewriterMode && <div style={{ height: '50vh' }} />}
        </div>
      </main>
    </div>
  );
};

export default Editor;