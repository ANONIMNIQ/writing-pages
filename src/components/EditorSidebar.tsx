import React from 'react';
import { BookOpen, ChevronRight, History, RotateCcw, Trash2 } from 'lucide-react';
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
  onDeleteRevision?: (id: string) => void;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({ 
  chapters, 
  onChapterClick, 
  isVisible,
  revisions = [],
  onRestoreRevision,
  onDeleteRevision
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

              <div className="space-y-6">
                {revisions.length > 0 ? (
                  revisions.map((rev) => (
                    <div 
                      key={rev.id} 
                      className="group w-full relative transition-all"
                    >
                      {/* A4 Aspect Ratio Container (1:1.414) */}
                      <div 
                        className="relative w-full pt-[141.4%] rounded-xl border border-border/40 bg-card/30 hover:bg-accent/30 transition-all overflow-hidden shadow-lg cursor-pointer"
                        onClick={() => onRestoreRevision?.(rev)}
                      >
                        <div className="absolute inset-0 p-4 text-xs font-serif overflow-hidden">
                          <p className="font-bold text-sm mb-2 line-clamp-1">{rev.title || 'Untitled Revision'}</p>
                          <p className="opacity-60 italic">
                            {rev.content.substring(0, 600)}...
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 px-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-tighter text-foreground/40">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] font-mono text-foreground/30">
                            {new Date(rev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestoreRevision?.(rev);
                            }}
                            className="p-2 rounded-full hover:bg-primary/10 text-primary"
                            title="Restore this version"
                          >
                            <RotateCcw size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRevision?.(rev.id);
                            }}
                            className="p-2 rounded-full hover:bg-destructive/10 text-destructive"
                            title="Delete revision"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic opacity-50">No revisions yet. One is created every time you publish or manually save.</p>
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