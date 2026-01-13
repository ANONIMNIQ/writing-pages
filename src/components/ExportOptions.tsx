import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportOptionsProps {
  title: string;
  content: string;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ title, content }) => {
  
  const handleExport = (format: 'txt' | 'pdf' | 'docx') => {
    
    // Simple TXT download implementation for basic functionality
    if (format === 'txt') {
      const textContent = `${title}\n\n${content}`;
      const blob = new Blob([textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("TXT file downloaded successfully.");
    } else {
      toast.info(`Exporting "${title}" as ${format.toUpperCase()}... (Functionality pending implementation)`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Download className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('txt')}>
          Export as TXT
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          Export as PDF (Coming Soon)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('docx')}>
          Export as Word Document (Coming Soon)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportOptions;