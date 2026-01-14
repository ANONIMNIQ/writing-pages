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
  
  const handleExport = (format: 'txt' | 'md' | 'pdf' | 'docx') => {
    let blob: Blob;
    let extension: string;

    if (format === 'txt') {
      const textContent = `${title}\n\n${content}`;
      blob = new Blob([textContent], { type: 'text/plain' });
      extension = 'txt';
    } else if (format === 'md') {
      const mdContent = `# ${title}\n\n${content}`;
      blob = new Blob([mdContent], { type: 'text/markdown' });
      extension = 'md';
    } else {
      toast.info(`Exporting "${title}" as ${format.toUpperCase()}... (Functionality pending implementation)`);
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
    toast.success(`${extension.toUpperCase()} file downloaded successfully.`);
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
          Export as Plain Text (.txt)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('md')}>
          Export as Markdown (.md)
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