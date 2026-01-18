import React, { useEffect, useRef } from 'react';
import { MessageSquare, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface Note {
  id: string;
  text: string;
  highlightedText: string;
  createdAt: number;
}

interface NotesSidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onUpdateNote: (id: string, text: string) => void;
  onDeleteNote: (id: string) => void;
  onFocusNote: (id: string) => void;
  isVisible: boolean;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({ 
  notes, 
  activeNoteId,
  onUpdateNote, 
  onDeleteNote, 
  onFocusNote,
  isVisible 
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll the sidebar to the active note when it changes
  useEffect(() => {
    if (activeNoteId) {
      const element = document.getElementById(`note-card-${activeNoteId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeNoteId]);

  if (!isVisible) return null;

  return (
    <aside className="w-80 border-l border-border/40 h-full flex flex-col bg-background/50 backdrop-blur-sm hidden xl:flex shrink-0">
      <div className="p-6 border-b border-border/20 flex items-center justify-between">
        <div className="flex items-center space-x-2 opacity-40">
          <MessageSquare size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Sidenotes</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{notes.length} total</span>
      </div>
      
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {notes.length > 0 ? (
            notes.map((note) => {
              const isActive = activeNoteId === note.id;
              
              return (
                <div 
                  key={note.id} 
                  id={`note-card-${note.id}`}
                  className={cn(
                    "group transition-all duration-300 rounded-xl border cursor-pointer overflow-hidden",
                    isActive 
                      ? "bg-yellow-50 dark:bg-green-900/20 border-yellow-200/50 dark:border-green-800/30 shadow-sm" 
                      : "bg-transparent border-transparent hover:border-border/40 hover:bg-accent/30"
                  )}
                  onClick={() => onFocusNote(note.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={cn(
                          "text-[10px] font-bold uppercase tracking-tighter mb-1 transition-colors",
                          isActive ? "text-yellow-700 dark:text-green-400" : "text-primary/40"
                        )}>
                          "{note.highlightedText}"
                        </p>
                      </div>
                      
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive/50 hover:text-destructive hover:bg-destructive/5"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note.id);
                          }}
                        >
                          <Trash2 size={12} />
                        </Button>
                        {isActive ? (
                          <ChevronUp size={14} className={cn("ml-1", isActive ? "text-yellow-600/50 dark:text-green-600/50" : "opacity-20")} />
                        ) : (
                          <ChevronDown size={14} className="ml-1 opacity-20" />
                        )}
                      </div>
                    </div>
                    
                    {isActive ? (
                      <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Textarea
                          value={note.text}
                          onChange={(e) => onUpdateNote(note.id, e.target.value)}
                          placeholder="Add your thoughts..."
                          className="min-h-[100px] bg-white/60 dark:bg-black/20 border-none focus-visible:ring-0 p-3 text-sm leading-relaxed resize-none rounded-lg"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="mt-2 flex justify-end">
                          <span className="text-[9px] text-muted-foreground font-mono opacity-50">
                            {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      note.text && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1 italic px-0.5">
                          {note.text}
                        </p>
                      )
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-24 text-center space-y-3 opacity-20">
              <MessageSquare className="mx-auto h-10 w-10" />
              <p className="text-xs italic px-8">Highlight text in the editor to pin a note here.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default NotesSidebar;