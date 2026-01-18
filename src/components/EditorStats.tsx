import React from 'react';
import { Clock, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorStatsProps {
  characters: number;
  readingTime: number;
  isTypewriterMode: boolean;
}

const EditorStats: React.FC<EditorStatsProps> = ({ characters, readingTime, isTypewriterMode }) => {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 flex items-center space-x-6 px-4 py-2 rounded-full bg-background/50 backdrop-blur-md border border-border/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all duration-700 z-30",
      isTypewriterMode ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100"
    )}>
      <div className="flex items-center gap-2">
        <Type className="h-3 w-3" />
        <span>{characters} <span className="text-muted-foreground/40 ml-0.5">Chars</span></span>
      </div>
      <div className="w-[1px] h-3 bg-border/40" />
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3" />
        <span>{readingTime} <span className="text-muted-foreground/40 ml-0.5">Min Read</span></span>
      </div>
    </div>
  );
};

export default EditorStats;