import React from 'react';
import { MessageSquare, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Note {
  id: string;
  text: string;
  highlightedText: string;
  createdAt: number;
}

interface NotesSidebarProps {
  notes: Note[];
  onUpdateNote: (id: string, text: string) => void;
  onDeleteNote: (id: string) => void;
  onFocusNote: (id: string) => void;
  isVisible: boolean;
}

const NotesSidebar: React.FC<NotesSidebarProps> = ({ 
  notes, 
  onUpdateNote, 
  onDeleteNote, 
  onFocusNote,
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <aside className="w-80 border-l border-border/40 h-full flex flex-col bg-background/50 backdrop-blur-sm hidden xl:flex shrink-0">
      <div className="p-6 border-b border-border/20 flex items-center justify-between">
        <div className="flex items-center space-x-2 opacity-40">
          <MessageSquare size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Sidenotes</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{notes.length} notes</span>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div 
                key={note.id} 
                id={`note-card-${note.id}`}
                className="group space-y-3 p-4 rounded-xl border border-transparent hover:border-border/40 hover:bg-accent/30 transition-all duration-200"
                onClick={() => onFocusNote(note.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-tighter mb-1 line-clamp-1">
                      Context: "{note.highlightedText}"
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive/50 hover:text-destructive hover:bg-destructive/5"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
                
                <Textarea
                  value={note.text}
                  onChange={(e) => onUpdateNote(note.id, e.target.value)}
                  placeholder="Add your thoughts..."
                  className="min-h-[80px] bg-transparent border-none focus-visible:ring-0 p-0 text-sm leading-relaxed resize-none shadow-none"
                />
                
                <div className="pt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[9px] text-muted-foreground font-mono">
                     {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-2 opacity-30">
              <MessageSquare className="mx-auto h-8 w-8" />
              <p className="text-xs italic">Highlight text to add your first note.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default NotesSidebar;