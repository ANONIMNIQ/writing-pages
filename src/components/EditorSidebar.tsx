import React from 'react';
import { BookOpen, ChevronRight, History, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Chapter {
  id: string;
  text: string;
  level: number;
}

interface Revision {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface EditorSidebarProps {
  chapters: Chapter[];
  onChapterClick: (id: string) => void;
  isVisible: boolean;
  revisions?: Revision[];
  onRestoreRevision?: (revision: Revision) => void;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({ 
  chapters, 
  onChapterClick, 
  isVisible,
  revisions = [],
  onRestoreRevision
}) => {
  if (!isVisible) return null;

  return (
    <aside className="w-72 border-r border-border/40 h-full flex flex-col bg-background/50 backdrop-blur-sm hidden lg:flex shrink-0">
      <Tabs defaultValue="nav" className="flex flex-col h-full">
        <div className="px-6 pt-6">
          <TabsList className="w-full bg-muted/30 rounded-full p-1 h-10">
            <TabsTrigger value="nav" className="rounded-full flex-1 text-[10px] font-bold uppercase tracking-widest">
              Sections
            </TabsTrigger>
            <TabsTrigger value="rev" className="rounded-full flex-1 text-[10px] font-bold uppercase tracking-widest">
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="nav" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-8 opacity-40">
                <BookOpen size={14} />
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
                  <p className="text-xs text-muted-foreground italic opacity-50">Add headers to see them here.</p>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="rev" className="flex-1 overflow-hidden m-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-8 opacity-40">
                <History size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Revisions</span>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {revisions.length > 0 ? (
                  revisions.map((rev) => (
                    <div 
                      key={rev.id} 
                      className="group flex flex-col items-center"
                    >
                      <div 
                        onClick={() => onRestoreRevision?.(rev)}
                        className="relative w-full aspect-[1/1.4] bg-card border border-border/40 shadow-sm rounded-sm p-4 overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/20 transition-all origin-top group-hover:scale-[1.02]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/80 z-10" />
                        <h4 className="text-[10px] font-bold uppercase tracking-tighter mb-2 opacity-80 truncate">{rev.title}</h4>
                        <p className="text-[8px] font-serif leading-relaxed text-muted-foreground/60 select-none">
                          {rev.content.substring(0, 400)}...
                        </p>
                        <div className="absolute bottom-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg">
                            <RotateCcw size={14} />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-tighter text-foreground/40">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-[9px] font-mono text-foreground/30">
                          {new Date(rev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic opacity-50">No revisions yet. They are created automatically while you write.</p>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
};

export default EditorSidebar;