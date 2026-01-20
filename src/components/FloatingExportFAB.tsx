import React, { useState } from 'react';
import { Download, X, FileText, FileCode, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FloatingExportFABProps {
  title: string;
  content: string;
}

const FloatingExportFAB: React.FC<FloatingExportFABProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: 'txt' | 'md' | 'pdf' | 'docx') => {
    let blob: Blob;
    let extension: string;

    if (format === 'txt') {
      blob = new Blob([`${title}\n\n${content}`], { type: 'text/plain' });
      extension = 'txt';
    } else if (format === 'md') {
      blob = new Blob([`# ${title}\n\n${content}`], { type: 'text/markdown' });
      extension = 'md';
    } else {
      toast.info(`Exporting as ${format.toUpperCase()}... (Coming Soon)`);
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported as ${extension.toUpperCase()}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Background Blur Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 transition-all duration-300 pointer-events-none",
          isOpen ? "bg-background/20 backdrop-blur-sm pointer-events-auto opacity-100" : "opacity-0"
        )}
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        {/* Menu Items */}
        <div 
          className={cn(
            "flex flex-col items-center space-y-3 mb-6 transition-all duration-300 origin-bottom",
            isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 translate-y-10 pointer-events-none"
          )}
        >
          <Button 
            variant="outline" 
            className="rounded-full shadow-lg gap-2 px-6 h-12 border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl hover:bg-white/20 dark:hover:bg-black/30 transition-all"
            onClick={() => handleExport('txt')}
          >
            <FileText size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Plain Text (.txt)</span>
          </Button>
          <Button 
            variant="outline" 
            className="rounded-full shadow-lg gap-2 px-6 h-12 border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-xl hover:bg-white/20 dark:hover:bg-black/30 transition-all"
            onClick={() => handleExport('md')}
          >
            <FileCode size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Markdown (.md)</span>
          </Button>
          <Button 
            variant="outline" 
            className="rounded-full shadow-lg gap-2 px-6 h-12 border-white/10 bg-white/5 dark:bg-black/10 backdrop-blur-xl opacity-50 cursor-not-allowed"
            disabled
          >
            <FileJson size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">PDF (Soon)</span>
          </Button>
        </div>

        {/* Main FAB Toggle */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 border border-white/20",
            isOpen 
              ? "bg-foreground text-background rotate-90 scale-110" 
              : "bg-white/10 dark:bg-black/20 backdrop-blur-xl text-foreground hover:scale-110 hover:bg-white/20 dark:hover:bg-black/30"
          )}
        >
          {isOpen ? <X size={28} /> : <Download size={28} />}
        </Button>
      </div>
    </>
  );
};

export default FloatingExportFAB;