import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Chapter {
  id: string;
  text: string;
  level: number;
}

interface EditorSidebarProps {
  chapters: Chapter[];
  onChapterClick: (id: string) => void;
  isVisible: boolean;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({ chapters, onChapterClick, isVisible }) => {
  if (!isVisible) return null;

  return (
    <aside className="w-64 border-r border-border/40 h-full overflow-y-auto bg-background/50 backdrop-blur-sm hidden lg:block shrink-0">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8 opacity-40">
          <BookOpen size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Navigation</span>
        </div>
        
        <div className="space-y-4">
          {chapters.length > 0 ? (
            chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => onChapterClick(chapter.id)}
                className={cn(
                  "group flex items-start text-left w-full hover:bg-accent/50 p-2 -mx-2 rounded-md transition-all",
                  chapter.level === 1 ? "pl-2" : "pl-6"
                )}
              >
                <ChevronRight 
                  size={12} 
                  className="mt-1.5 mr-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" 
                />
                <span className={cn(
                  "text-sm tracking-tight leading-tight transition-colors",
                  chapter.level === 1 
                    ? "font-bold text-foreground/80" 
                    : "font-medium text-foreground/50"
                )}>
                  {chapter.text}
                </span>
              </button>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">No chapters defined yet. Highlight text and select "New Chapter" to start organizing.</p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default EditorSidebar;